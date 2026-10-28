/* Gera assets/css/tokens.css a partir de scripts/tokens.mjs.
 *
 *   node scripts/build-tokens.mjs
 *
 * O CSS é derivado, nunca editado. O gate verify-tokens.mjs falha se o
 * arquivo em disco divergir do que renderTokens() produziria. */
import fs from 'node:fs'
import { ALL_TOKENS, TYPE_SCALE, GROUPS } from './tokens.mjs'

const OUT = 'src/styles/tokens.css'

const LABELS = Object.fromEntries(GROUPS.map((g) => [g.id, g.label]))

const desc = (t) => (t.desc ? ` /* ${t.desc} */` : '')

const byGroup = new Map()
for (const t of ALL_TOKENS) {
  if (!byGroup.has(t.group)) byGroup.set(t.group, [])
  byGroup.get(t.group).push(t)
}

const blocks = []
for (const [group, tokens] of byGroup) {
  const lines = tokens.map((t) => `  ${t.name}: ${t.value};${desc(t)}`).join('\n')
  blocks.push(`  /* ${LABELS[group] || group} */\n${lines}`)
}

const typeBlocks = Object.entries(TYPE_SCALE).map(
  ([name, t]) =>
    `  /* ${name} — ${t.use} */\n  --type-${name}-size: ${t.size};\n  --type-${name}-leading: ${t.leading};\n  --type-${name}-tracking: ${t.tracking};`,
)

/** Devolve o CSS esperado. Não escreve nada — o gate usa isto para
    comparar com o disco sem regenerar o arquivo que está verificando. */
export function renderTokens() {
  const LABELS = Object.fromEntries(GROUPS.map((g) => [g.id, g.label]))
  /* A descrição vai como comentário CSS legível, e o grupo como `group:<id>`
     para que a página de referência possa se agrupar lendo o artefato —
     em vez de manter uma segunda lista de nomes, que voltaria a divergir. */
  const desc = (t) => (t.desc ? ` /* ${t.desc} | group:${t.group} */` : ` /* group:${t.group} */`)

  const byGroup = new Map()
  for (const t of ALL_TOKENS) {
    if (!byGroup.has(t.group)) byGroup.set(t.group, [])
    byGroup.get(t.group).push(t)
  }

  const blocks = []
  for (const [group, tokens] of byGroup) {
    const lines = tokens.map((t) => `  ${t.name}: ${t.value};${desc(t)}`).join('\n')
    blocks.push(`  /* ${LABELS[group] || group} */\n${lines}`)
  }

  const typeBlocks = Object.entries(TYPE_SCALE).map(
    ([name, t]) =>
      `  /* ${name} — ${t.use} | group:type */\n  --type-${name}-size: ${t.size};\n  --type-${name}-leading: ${t.leading};\n  --type-${name}-tracking: ${t.tracking};`,
  )

  return `@charset "utf-8";

/* ============================================================
   Cadterreiros · tokens
   ARQUIVO GERADO — não editar à mão.
   Fonte: scripts/tokens.mjs · regerar: node scripts/build-tokens.mjs
   ============================================================ */

:root {
${blocks.join('\n\n')}
}

:root {
  /* Escala tipográfica. O tracking acompanha o tamanho: quanto maior o
     display, mais fechado. */
${typeBlocks.join('\n\n')}
}
`
}

const css = renderTokens()

if (import.meta.url === `file://${process.argv[1]}`) {
  fs.writeFileSync(OUT, css)
  console.log(
    `${OUT} gerado · ${ALL_TOKENS.length} tokens em ${new Set(ALL_TOKENS.map((t) => t.group)).size} grupos ` +
      `· ${Object.keys(TYPE_SCALE).length} degraus de tipo · ` +
      `${(css.length / 1024).toFixed(1)}kB`,
  )
}
