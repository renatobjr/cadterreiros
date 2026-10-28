/* Confere contraste de todos os pares de cor realmente usados na interface.
   Falha (exit 1) se algum par de texto ficar abaixo do WCAG AA. */
import { contrast, hex, TOKENS, NATION_COLORS, WHITE, oklch } from './color.mjs'

const AA_TEXT = 4.5
const AA_LARGE = 3.0

/* [rótulo, foreground, background, mínimo] */
const PAIRS = [
  ['corpo de texto sobre papel', TOKENS.fg, TOKENS.bg, AA_TEXT],
  ['corpo de texto sobre cartão', TOKENS.fg, TOKENS.surface, AA_TEXT],
  ['corpo de texto sobre recuado', TOKENS.fg, TOKENS.surfaceSunk, AA_TEXT],
  ['tom intermediário sobre papel', TOKENS.fgSoft, TOKENS.bg, AA_TEXT],
  ['tom intermediário sobre cartão', TOKENS.fgSoft, TOKENS.surface, AA_TEXT],
  ['tom intermediário sobre recuado', TOKENS.fgSoft, TOKENS.surfaceSunk, AA_TEXT],
  ['metadado sobre papel', TOKENS.muted, TOKENS.bg, AA_TEXT],
  ['metadado sobre cartão', TOKENS.muted, TOKENS.surface, AA_TEXT],
  ['metadado sobre recuado', TOKENS.muted, TOKENS.surfaceSunk, AA_TEXT],
  ['acento sobre papel', TOKENS.accent, TOKENS.bg, AA_TEXT],
  ['acento sobre cartão', TOKENS.accent, TOKENS.surface, AA_TEXT],
  ['acento sobre fundo suave', TOKENS.accent, TOKENS.accentSoft, AA_TEXT],
  ['branco sobre acento (botão)', WHITE, TOKENS.accent, AA_TEXT],
  ['branco sobre acento profundo', WHITE, TOKENS.accentDeep, AA_TEXT],
  ['branco sobre perigo', WHITE, TOKENS.danger, AA_TEXT],
  ['dourado sobre acento profundo', TOKENS.gold, TOKENS.accentDeep, AA_TEXT],
  ['texto claro sobre acento profundo', TOKENS.onDeep, TOKENS.accentDeep, AA_TEXT],
  ['ok sobre papel', TOKENS.ok, TOKENS.bg, AA_TEXT],
  ['aviso sobre papel', TOKENS.warn, TOKENS.bg, AA_TEXT],
  ['perigo sobre papel', TOKENS.danger, TOKENS.bg, AA_TEXT],
  ['placeholder sobre papel', TOKENS.placeholder, TOKENS.bg, AA_TEXT],
  ['ghost hover: acento sobre suave', TOKENS.accent, TOKENS.accentSoft, AA_TEXT],
  ['borda de campo sobre papel', TOKENS.borderStrong, TOKENS.bg, AA_LARGE],
  ['borda de campo sobre cartão', TOKENS.borderStrong, TOKENS.surface, AA_LARGE],
  ['sublinhado de cabeçalho sobre recuado', TOKENS.borderStrong, TOKENS.surfaceSunk, AA_LARGE],
  ['borda externa de cartão sobre papel', TOKENS.border, TOKENS.bg, AA_LARGE],
  ['borda externa de tabela sobre papel', TOKENS.border, TOKENS.bg, AA_LARGE],
  ['anel de foco (acento) sobre papel', TOKENS.accent, TOKENS.bg, AA_LARGE],
  ['anel de foco (acento) sobre cartão', TOKENS.accent, TOKENS.surface, AA_LARGE],
  ['hover do botão primário (branco sobre tom escuro)', WHITE, TOKENS.accentHover, AA_TEXT],
]

/* A divisória interna de linha é decorativa — a WCAG 1.4.11 não exige 3:1
   para separador visual. Ela é verificada só contra o piso de "visível o
   suficiente para não sumir", e a estrutura real fica por conta da borda
   externa do contêiner, que passa 3:1 e é checada acima. */
PAIRS.push(['divisória decorativa sobre cartão', TOKENS.borderSoft, TOKENS.surface, 1.3])

/* Etiqueta de nação: texto branco sobre o preenchimento da cor. */
for (const [key, color] of Object.entries(NATION_COLORS)) {
  PAIRS.push([`naçã ${key}: branco sobre ${hex(color)}`, WHITE, color, AA_TEXT])
}

let fails = 0
console.log('par                                              razão    mínimo')
console.log('─'.repeat(64))
for (const [label, fg, bg, min] of PAIRS) {
  const r = contrast(fg, bg)
  const ok = r >= min
  if (!ok) fails++
  console.log(
    `${label.padEnd(46)} ${r.toFixed(2).padStart(6)}  ${String(min).padStart(5)}  ${
      ok ? 'PASS' : 'FALHA'
    }`,
  )
}


console.log('─'.repeat(64))
console.log(`${PAIRS.length} pares verificados · ${fails} falhas`)
if (fails) process.exit(1)
