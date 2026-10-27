/* Confere que toda classe usada no JSX tem regra no CSS, e vice-versa.
   Falha (exit 1) se houver classe usada sem estilo ou prefixo dinâmico
   que não corresponda a nenhuma regra. */
import fs from 'node:fs'

const cssFiles = ['base', 'components', 'pages', 'design-system'].map((f) => `src/styles/${f}.css`)

const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { recursive: true }).map((f) => `${d}/${f}`) : []
const codeFiles = [
  'src/main.tsx',
  ...walk('src/components'),
  ...walk('src/pages'),
  ...walk('src'),
].filter((f) => fs.existsSync(f) && /\.(tsx?|jsx?)$/.test(f))

/* Comentários citam nomes de arquivo (tokens.css, tokens.mjs) e nomes de
   classe em prosa. Sem removê-los, vira classe órfã fantasma. */
const css = cssFiles
  .map((f) => fs.readFileSync(f, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ''))
  .join('\n')
const code = codeFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n')

/* Classes definidas por seletor de classe (não por menção em comentário). */
const defined = new Set(
  [...css.matchAll(/\.([a-zA-Z][\w-]*)(?=[\s,{:.\[>])/g)].map((m) => m[1]),
)

const CLASS_LITERAL = /^[a-zA-Z][\w-]*$/
const addClasses = (text, into = used) => {
  for (const c of text.split(/\s+/)) if (c && CLASS_LITERAL.test(c)) into.add(c)
}

const used = new Set()

/* className="btn btn--primary" e className='…' — só valores literais. */
for (const m of code.matchAll(/className=["']([^"']+)["']/g)) addClasses(m[1])

/* className com template literal. Ex.: `btn btn--${variant}`.
   O que vem antes de `${` é prefixo, não classe: o sufixo depende de uma
   expressão que não se resolve estaticamente. O que vem depois é classe. */
const templateLiterals = [...code.matchAll(/className=\{`([^`]+)`\}/g)].map((m) => m[1])
const dynamicPrefixes = new Set()

for (const t of templateLiterals) {
  /* remove cada `${...}` junto com o token que o antecede */
  addClasses(t.replace(/\S*\$\{[^}]*\}/g, ' '))
  /* o que antecede um ${...} é prefixo dinâmico */
  for (const m of t.matchAll(/(\S*)\$\{/g)) if (m[1]) dynamicPrefixes.add(m[1])
  /* strings citadas na expressão, ex. ternário dentro do template */
  for (const s of t.matchAll(/['"]([^'"]+)['"]/g)) addClasses(s[1])
}

/* Se o fragmento também aparece como classe literal em outro ponto, é só
   uma classe comum — trata como literal e não como prefixo. */
for (const c of used) dynamicPrefixes.delete(c)

/* className={expressão} sem backtick — normalmente ternário de variante.
   Qualquer string literal dentro das chaves é uma classe real, exceto quando
   é operando de comparação (`tone === 'danger'` não é uma classe). */
for (const m of code.matchAll(/className=\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g)) {
  if (m[1].includes('`')) continue
  for (const s of m[1].matchAll(/(['"])([^'"]+)\1/g)) {
    if (/[=!]==\s*$|[=!]=\s*$/.test(m[1].slice(0, s.index))) continue
    addClasses(s[2])
  }
}

const missing = [...used].filter((c) => !defined.has(c)).sort()

/* Um prefixo dinâmico está coberto se ao menos uma classe do CSS começar
   com ele. Prefixo sem nenhuma é erro: alguém interpola e o estilo não existe. */
const missingDynamic = [...dynamicPrefixes]
  .filter((p) => ![...defined].some((c) => c.startsWith(p)))
  .sort()

const coveredByPrefix = (c) => [...dynamicPrefixes].some((p) => c.startsWith(p))
const unused = [...defined].filter((c) => !used.has(c) && !coveredByPrefix(c)).sort()

console.log(
  `definidas: ${defined.size} · usadas: ${used.size} · ` +
    `prefixos dinâmicos: ${[...dynamicPrefixes].sort().join(', ') || 'nenhum'}`,
)
console.log(missing.length ? `SEM REGRA NO CSS: ${missing.join(', ')}` : 'toda classe usada tem regra')
if (missingDynamic.length) console.log(`PREFIXO DINÂMICO SEM REGRA: ${missingDynamic.join(', ')}`)
if (unused.length) console.log(`definidas e não usadas no JSX: ${unused.join(', ')}`)

if (missing.length || missingDynamic.length) process.exit(1)
