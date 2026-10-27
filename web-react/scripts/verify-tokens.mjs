/* Confere a integridade dos tokens.
 *
 *  1. Nenhum var(--x) usado sem definição (CSS e JSX).
 *  2. Nenhuma custom property definida e não usada.
 *  3. assets/css/tokens.css é idêntico ao que scripts/tokens.mjs gera —
 *     este é o gate que impede o drift silencioso entre a fonte e o CSS.
 *  4. Nenhum token órfão na fonte.
 *
 * Falha (exit 1) em qualquer violação. */
import fs from 'node:fs'
import { ALL_TOKENS, TOKEN_MAP } from './tokens.mjs'
import { renderTokens } from './build-tokens.mjs'

const cssFiles = ['tokens', 'base', 'components', 'pages', 'design-system', 'prototype'].map((f) => `src/styles/${f}.css`)
const walk = (d) => fs.existsSync(d) ? fs.readdirSync(d, { recursive: true }).map((f) => `${d}/${f}`) : []
const codeFiles = [
  ...walk('src'),
].filter((f) => fs.existsSync(f) && /\.(tsx?|jsx?)$/.test(f))

/* Comentários citam tokens como exemplo — `var(--x)` numa nota não é
   referência a um token que precise existir. */
const stripComments = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1')

const readAll = (files) => files.map((f) => stripComments(fs.readFileSync(f, 'utf8'))).join('\n')
const css = readAll(cssFiles)
const code = readAll(codeFiles)

let bad = 0

/* ---------- 1. usados mas não definidos ---------- */
const defined = new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1]))
const used = new Set([
  ...[...css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]),
  ...[...code.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((m) => m[1]),
  ...[...code.matchAll(/['"](--[a-z0-9-]+)['"]\s*:/g)].map((m) => m[1]),
])

const undefinedVars = [...used].filter((v) => !defined.has(v)).sort()
if (undefinedVars.length) {
  console.log('usadas e NÃO definidas:')
  for (const v of undefinedVars) console.log('  ', v)
  bad++
}

/* ---------- 2. definidas e não usadas ---------- */
const orphans = [...defined].filter((v) => !used.has(v)).sort()
if (orphans.length) {
  console.log('definidas e NÃO usadas:')
  for (const v of orphans) console.log('  ', v)
  bad++
}

/* ---------- 3. paridade entre a fonte e o CSS em disco ----------
   Compara o arquivo com renderTokens(), que é puro: não escreve nada.
   A primeira versão deste gate rodava o build antes de comparar, o que
   regenerava o arquivo e escondia exatamente a edição manual que ele
   deveria pegar — passava verde nos dois testes de drift. */
const onDisk = fs.readFileSync('src/styles/tokens.css', 'utf8')
const expected = renderTokens()

if (onDisk !== expected) {
  const diskLines = onDisk.split('\n')
  const wantLines = expected.split('\n')
  const drift = []
  for (let i = 0; i < Math.max(diskLines.length, wantLines.length); i++) {
    if (diskLines[i] !== wantLines[i]) {
      drift.push(`  linha ${i + 1}\n    em disco: ${diskLines[i]}\n    na fonte: ${wantLines[i]}`)
    }
  }
  console.log('tokens.css divergente da fonte (rode node scripts/build-tokens.mjs):')
  for (const d of drift.slice(0, 12)) console.log(d)
  if (drift.length > 12) console.log(`  … e mais ${drift.length - 12} linha(s)`)
  bad++
}

/* cada token da fonte precisa existir no disco com o valor exato */
for (const [name, value] of Object.entries(TOKEN_MAP)) {
  const re = new RegExp(`^\\s*${name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*:\\s*([^;]+);`, 'm')
  const m = onDisk.match(re)
  if (!m) {
    console.log(`tokens.css não declara ${name} (existe na fonte)`)
    bad++
  } else if (m[1].trim() !== value) {
    console.log(`tokens.css: ${name} = "${m[1].trim()}" mas a fonte diz "${value}"`)
    bad++
  }
}

/* ---------- 4. tokens órfãos na fonte ---------- */
const orphanSource = ALL_TOKENS.filter((t) => !defined.has(t.name)).map((t) => t.name)
if (orphanSource.length) {
  console.log('na fonte mas ausentes do CSS gerado:')
  for (const n of orphanSource) console.log('  ', n)
  bad++
}

console.log(
  `\n${defined.size} definidas · ${used.size} usadas · ${ALL_TOKENS.length} na fonte · ` +
    `${bad} problema(s)`,
)
if (bad) process.exit(1)
