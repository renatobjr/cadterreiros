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

/* ---------- paridade com a matemática do navegador ----------
   A página /design-system converte e mede em app/contrast.js. As duas já
   divergiram duas vezes, em lugares diferentes:
     · app/contrast.js tinha s_ na quarta potência — a conversão inteira
       estava errada, e este gate não pegou, porque só exercitava
       contrast() sobre cores já convertidas;
     · e o build media float enquanto a página media 8 bits, o que fazia
       --border passar a 3,01:1 no gate e reprovar a 2,96:1 na página.
   Por isso a comparação começa na string oklch() da fonte: converte dos
   dois lados, e só então compara os pares. */
const nav = await import('../app/contrast.js')
const { TOKEN_MAP } = await import('./tokens.mjs')

let drift = 0

/* 1. conversão oklch() → sRGB, token a token */
const buildRgb = {}
for (const [name, raw] of Object.entries(TOKEN_MAP)) {
  if (!raw.startsWith('oklch(')) continue
  const m = raw.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)/)
  const peloBuild = oklch(Number(m[1]) / 100, Number(m[2]), Number(m[3]))
  const pelaPagina = nav.parseColor(raw)
  buildRgb[name] = peloBuild
  const iguais =
    peloBuild.length === pelaPagina.length &&
    peloBuild.every((v, i) => v === pelaPagina[i])
  if (!iguais) {
    console.log(
      `CONVERSÃO DIVERGENTE ${name}: build [${peloBuild}] vs página [${pelaPagina}]`,
    )
    drift++
  }
}

/* 2. contraste de cada par, com as cores convertidas por cada lado */
console.log(`conversão oklch→sRGB idêntica em ${Object.keys(buildRgb).length} tokens · ${drift} divergência(s)`)

if (drift) {
  console.log('\napp/contrast.js e scripts/color.mjs precisam do mesmo algoritmo.')
  process.exit(1)
}

/* 3. razão de contraste, medida dos dois lados sobre os mesmos pares */
let parDrift = 0
const lados = [
  ['build', (f, b) => contrast(f, b)],
  ['página', (f, b) => nav.contrast(f, b)],
]
for (const [label, fg, bg] of PAIRS) {
  if (!fg || !bg) continue
  const medidas = lados.map(([, fn]) => fn(fg, bg))
  if (Math.abs(medidas[0] - medidas[1]) > 0.005) {
    console.log(
      `RAZÃO DIVERGENTE ${label}: build ${medidas[0].toFixed(3)} vs ` +
        `página ${medidas[1].toFixed(3)}`,
    )
    parDrift++
  }
}
if (parDrift) process.exit(1)
console.log(`build e página medem idêntico em ${PAIRS.length} pares`)

console.log('─'.repeat(64))
console.log(`${PAIRS.length} pares verificados · ${fails} falhas`)
if (fails) process.exit(1)
