/* Conversão OKLch → sRGB erazão de contraste WCAG 2.1.
   Usado por scripts/verify-contrast.mjs e pelos testes de token. */

export const srgbToLin = (c) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

export function relLum([r, g, b]) {
  return (
    0.2126 * srgbToLin(r / 255) +
    0.7152 * srgbToLin(g / 255) +
    0.0722 * srgbToLin(b / 255)
  )
}

export function contrast(a, b) {
  const l1 = relLum(a)
  const l2 = relLum(b)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

export function oklch(L, C, H) {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  const f = (x) =>
    Math.min(1, Math.max(0, x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055))
  /* Quantiza para 8 bits. O navegador exibe sRGB em 8 bits por canal, então
     é esse o valor que chega ao olho — medir o float dá uma razão ~1% maior
     que a real. Isso já fez --border passar a 3.01:1 aqui e reprovar a 2.96:1
     no navegador. app/contrast.js faz o mesmo arredondamento, e
     verify-contrast.mjs confere que as duas implementações concordam. */
  return [f(r) * 255, f(g) * 255, f(bl) * 255].map((v) => Math.round(v))
}

export const WHITE = [255, 255, 255]
export const hex = (rgb) =>
  '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

/* Tokens do sistema — mesma definição de assets/css/base.css. */
/* Os valores de cor NÃO vivem aqui. Este arquivo é a matemática
   (OKLch → sRGB → luminância → razão de contraste); scripts/tokens.mjs é
   a fonte. A combinação vivia duplicada e divergiu: o verificador media
   --danger com L=18,5% enquanto o CSS usava 46% — um erro de luminância
   de ordem de grandeza que o gate reportava como aprovado. */
import { TOKEN_MAP } from './tokens.mjs'

/** Converte "oklch(46% 0.185 25)" em [r,g,b] sRGB. */
export function tokenColor(name) {
  const raw = TOKEN_MAP[name]
  if (!raw) throw new Error(`token inexistente: ${name}`)
  const m = raw.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!m) throw new Error(`valor não é oklch: ${name} = ${raw}`)
  return oklch(Number(m[1]) / 100, Number(m[2]), Number(m[3]))
}

export const TOKENS = Object.fromEntries(
  Object.keys(TOKEN_MAP)
    .filter((n) => TOKEN_MAP[n].startsWith('oklch('))
    .map((n) => [n.replace(/^--/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase()), tokenColor(n)]),
)

/* Cores de nação, mesma definição de app/domain.js.
   L calibrado no ponto mais claro que ainda dá 4.6:1 com texto branco
   (scripts/verify-contrast.mjs confirma). O saturação do original do site
   (Vuetify) era maior, mas reproviava AA. */
export const NATION_COLORS = {
  umbanda: oklch(0.534, 0.145, 165),
  'nagô': oklch(0.566, 0.145, 78),
  ketu: oklch(0.57, 0.115, 62),
  angola: oklch(0.55, 0.11, 148),
  jeje: oklch(0.552, 0.12, 230),
  'ekiti efon': oklch(0.574, 0.13, 300),
  quimbanda: oklch(0.578, 0.14, 18),
  outros: oklch(0.564, 0.045, 55),
}
