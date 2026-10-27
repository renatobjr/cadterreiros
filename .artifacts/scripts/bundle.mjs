/* Bundler mínimo para o app React.
   Cada módulo vira uma função registered em `__mods`. Os `import` viram
   `const {X} = __req('id')` e os `export default` viram `__exports.default`.
   O bundle é depois transformado pelo Babel standalone em runtime. */
import fs from 'node:fs'
import path from 'node:path'

const ENTRY = 'app/main.jsx'
const OUT = 'app/bundle.jsx'

/* Ordem de declaração é irrelevante: o registry é resolvido em runtime. */
const modules = [
  'app/domain.js',
  'app/contrast.js',
  'app/router.js',
  'app/components/Nav.jsx',
  'app/components/Footer.jsx',
  'app/components/Map.jsx',
  'app/components/TerreiroCard.jsx',
  'app/pages/Home.jsx',
  'app/pages/Buscar.jsx',
  'app/pages/Terreiro.jsx',
  'app/pages/Sobre.jsx',
  'app/pages/Cciao.jsx',
  'app/store.js',
  'app/pages/Cadastro.jsx',
  'app/pages/Mapeamento.jsx',
  'app/pages/Admin.jsx',
  'app/pages/Entrar.jsx',
  'app/pages/Faq.jsx',
  'app/pages/DesignSystem.jsx',
  ENTRY,
]

/* Resolve './x' relativo ao arquivo que importa. */
function resolve(from, spec) {
  if (!spec.startsWith('.')) return spec
  const base = path.normalize(path.join(path.dirname(from), spec))
  for (const cand of [base, base + '.jsx', base + '.js', path.join(base, 'index.js')]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand
  }
  throw new Error(`não resolvi ${spec} de ${from}`)
}

/* `import React, { a, b } from 'x'` — a forma default+named precisa sair
   antes das formas mais simples, senão o `import { ... }` casa errado. */
const IMPORT_DEF_NAMED =
  /import\s+([A-Za-z_$][\w$]*)\s*,\s*\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g
const IMPORT_NAMED = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g
const IMPORT_DEFAULT =
  /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"]([^'"]+)['"];?/g
const IMPORT_BARE = /import\s+['"]([^'"]+)['"];?/g
const EXPORT_LIST = /export\s*\{([^}]*)\};?/g

/* `import React from 'react'` — o framework vem do window, não do registry. */
const REACT_ID = 'react'
function isBareReact(spec) {
  return spec === 'react' || spec === 'react-dom'
}

/* Nomes declarados com `export const/let/var/function/class`. */
const EXPORT_DECL =
  /export\s+(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g

function transform(file, src) {
  let out = src

  const named = [...src.matchAll(EXPORT_DECL)].map((m) => m[1])
  for (const m of src.matchAll(EXPORT_LIST)) {
    for (const n of m[1].split(',')) {
      const t = n.trim()
      if (t) named.push(t.split(/\s+as\s+/).pop().trim())
    }
  }
  const exportsTail = named
    .map((n) => `__exports[${JSON.stringify(n)}] = ${n};`)
    .join(' ')

  // export { a, b as c }
  out = out.replace(EXPORT_LIST, (_, names) => {
    return names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => {
        const [orig, alias] = n.split(/\s+as\s+/).map((s) => s.trim())
        return alias
          ? `__exports[${JSON.stringify(alias)}] = ${orig};`
          : `__exports[${JSON.stringify(orig)}] = ${orig};`
      })
      .join(' ')
  })

  // `export const X = ...` precisa virar `const X = ...; __exports.X = X`
  out = out.replace(
    /export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g,
    (_, kind, name) => `${kind} ${name}`,
  )
  out = out.replace(
    /export\s+(function|class)\s+([A-Za-z_$][\w$]*)/g,
    (_, kind, name) => `${kind} ${name}`,
  )

  // export default
  out = out.replace(
    /export\s+default\s+function\s+([A-Za-z_$][\w$]*)/g,
    (_, name) => `__exports.default = function ${name}`,
  )
  out = out.replace(/export\s+default\s+/g, '__exports.default = ')

  // import React, { a, b } from 'x'
  out = out.replace(IMPORT_DEF_NAMED, (_, def, names, spec) => {
    const binding = names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .join(', ')
    /* React vem do window; `import React, { useState }` precisa do default
       mais os hooks, que também vivem no objeto global. */
    return isBareReact(spec)
      ? `const ${def} = __react; const { ${binding} } = __react;`
      : `const { default: ${def}, ${binding} } = __req(${JSON.stringify(
          resolve(file, spec),
        )});`
  })

  // import { useState } from 'react'
  out = out.replace(IMPORT_NAMED, (_, names, spec) => {
    if (isBareReact(spec)) {
      const names2 = names
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean)
        .join(', ')
      return `const { ${names2} } = __react;`
    }
    const id = JSON.stringify(resolve(file, spec))
    const binding = names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => {
        const [orig, alias] = n.split(/\s+as\s+/).map((s) => s.trim())
        return alias ? `${orig}: ${alias}` : orig
      })
      .join(', ')
    return `const { ${binding} } = __req(${id});`
  })

  // import Default from 'x'
  out = out.replace(IMPORT_DEFAULT, (_, name, spec) => {
    if (isBareReact(spec)) return `const ${name} = __react.default || __react;`
    const id = JSON.stringify(resolve(file, spec))
    return `const ${name} = __req(${id}).default;`
  })

  // import 'x'
  out = out.replace(IMPORT_BARE, (_, spec) => {
    if (isBareReact(spec)) return ''
    return `__req(${JSON.stringify(resolve(file, spec))});`
  })

  if (exportsTail) out = `${out}\n${exportsTail}\n`
  return out
}

const seen = new Set()
const registry = []

function collect(file) {
  if (seen.has(file)) return
  seen.add(file)
  const src = fs.readFileSync(file, 'utf8')
  // registra dependências primeiro (ordem estável, sem recursão infinita)
  for (const m of src.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) collect(resolve(file, m[1]))
  registry.push({ file, code: transform(file, src) })
}

collect(ENTRY)
for (const f of modules) if (fs.existsSync(f)) collect(f)

const parts = registry.map(
  ({ file, code }) =>
    `__mods[${JSON.stringify(file)}] = function (__exports, __req) {\n${code}\n};`,
)

const header = `/* Cadterreiros · bundle gerado por scripts/bundle.mjs
   Edite os módulos em app/ e rode: node scripts/bundle.mjs */
const __react = window.React
const React = __react
const ReactDOM = window.ReactDOM
const __mods = Object.create(null)
const __cache = Object.create(null)
function __req(id) {
  if (__cache[id]) return __cache[id]
  const exports = {}
  __cache[id] = exports
  __mods[id](exports, __req)
  return exports
}
`

const boot = `\n__req(${JSON.stringify(ENTRY)})\n`

fs.writeFileSync(OUT, header + parts.join('\n\n') + boot)
console.log(
  'bundle:',
  OUT,
  (fs.statSync(OUT).size / 1024).toFixed(1) + 'kB',
  '· módulos:',
  registry.length,
)
