/* Confere que todo url() de CSS e todo src/href de HTML resolve para um
 * arquivo que existe de fato, resolvendo relativo ao arquivo que referencia.
 *
 * Cobre o modo de falha que quebrou as fontes: o CSS vive em assets/fonts/
 * mas o url() repetia assets/fonts/, apontando para assets/fonts/assets/.
 * Falha (exit 1) se algum caminho não existir. */
import fs from 'node:fs'
import path from 'node:path'

const CSS_FILES = ['src/styles/base.css', 'src/styles/components.css', 'src/styles/pages.css', 'public/fonts/fonts.css', 'public/fonts/fonts-brand.css']

const HTML = 'index.html'

let bad = 0
let checked = 0

/* ---------- url() em CSS ---------- */
for (const file of CSS_FILES) {
  const src = fs.readFileSync(file, 'utf8')
  const dir = path.dirname(file)
  for (const m of src.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
    const ref = m[1].trim()
    if (/^(https?:|data:|#|\/\/)/.test(ref)) continue
    checked++
    const resolved = path.join(dir, ref.split(/[?#]/)[0])
    if (!fs.existsSync(resolved)) {
      console.log(`CSS  ${file} → ${ref}`)
      console.log(`     resolve para ${resolved} — não existe`)
      bad++
    }
  }
}

/* ---------- src/href no HTML e referências em JSX ---------- */
const html = fs.readFileSync(HTML, 'utf8')
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  const ref = m[1]
  if (/^(https?:|data:|#|\/\/|mailto:)/.test(ref)) continue
  checked++
  // paths absolutos (ex.: /favicon.svg, /src/main.tsx) resolvem a partir da raiz do projeto
  // ou da pasta public/ (servida na raiz pelo Vite)
  let resolved = ref.startsWith('/') ? ref.slice(1) : ref
  if (!fs.existsSync(resolved) && fs.existsSync(path.join('public', resolved))) {
    resolved = path.join('public', resolved)
  }
  if (!fs.existsSync(resolved)) {
    console.log(`HTML ${HTML} → ${ref} — não existe`)
    bad++
  }
}

/* O app busca estes JSON em runtime; se faltar, a tela fica em "Carregando". */
const FETCHED = []
for (const f of FETCHED) {
  checked++
  if (!fs.existsSync(f)) {
    console.log(`FETCH ${f} — não existe`)
    bad++
  }
}

console.log(`${checked} referências · ${bad} quebrada(s)`)
if (bad) process.exit(1)
