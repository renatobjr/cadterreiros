/* Sincroniza o bloco de verificações das telas novas dentro de smoke.mjs.
 *
 * Idempotente: apaga qualquer cópia anterior pelo intervalo
 * `const METRICS = DATA.metrics` … `console.log('admin: sessão encerrada ok')`
 * e reinsere o conteúdo de admin-checks.mjs.
 *
 * Usa uma função como replacer de propósito: numa string de substituição,
 * `$$` é interpretado como escape para `$` e os seletores `$$(sel)` viram
 * `$(sel)`. */
import fs from 'node:fs'

const target = 'scripts/smoke.mjs'
const source = 'scripts/admin-checks.mjs'

const START = 'const METRICS = DATA.metrics'
const END = "console.log('admin: sessão encerrada ok')"
const ANCHOR = "if (errors.length) {\n  console.log('\\nERROS:')"

let s = fs.readFileSync(target, 'utf8')

/* 1. remove todas as cópias do bloco */
let removed = 0
for (;;) {
  const a = s.indexOf(START)
  if (a === -1) break
  const b = s.indexOf(END, a)
  if (b === -1) break
  s = s.slice(0, a) + s.slice(b + END.length).replace(/^\n+/, '\n')
  removed++
}

/* 2. reinsere a versão atual do arquivo-fonte.
   O comentário de cabeçalho do arquivo-fonte fica ANTES de START, então
   precisa sair — do contrário ele nunca é removido e se duplica a cada
   execução. */
let block = fs.readFileSync(source, 'utf8')
block = block.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '')
block = block.replace(/\s+$/, '')

if (!s.includes(ANCHOR)) {
  console.error('âncora final não encontrada')
  process.exit(1)
}
s = s.replace(ANCHOR, () => `${block}\n\n${ANCHOR}`)

/* 3. normaliza as linhas em branco ao redor do bloco, para o arquivo não
   crescer a cada execução */
s = s.replace(
  /console\.log\(`conteúdo verificado em \$\{contentChecks\.length\} rotas`\)\n{2,}/,
  'console.log(`conteúdo verificado em ${contentChecks.length} rotas`)\n\n',
)
s = s.replace(/\n{3,}/g, '\n\n')
if (!s.endsWith('\n')) s += '\n'

fs.writeFileSync(target, s)

const copies = (s.match(/const METRICS = DATA\.metrics/g) || []).length
console.log(
  `cópias removidas: ${removed} · bloco final: ${copies} · ` +
    `${(s.match(/\$\$\(/g) || []).length} chamadas $$( · ${s.split('\n').length} linhas`,
)
if (copies !== 1) {
  console.error('esperava exatamente 1 bloco')
  process.exit(1)
}
