/* Servidor estático local, sem dependência nenhuma (só o módulo http do
 * Node). Uso: node scripts/serve.mjs [porta]
 *
 * Por que é preciso abrir por http:// e não por file://:
 *
 *  1. O Babel standalone carrega `app/bundle.jsx` por XHR. Sob `file://` cada
 *     arquivo é uma origem opaca própria, e o Chrome bloqueia a leitura
 *     cruzada — é o erro de CORS da primeira linha do log.
 *  2. Mesmo sem o Babel, o app busca `app/data/*.json` com fetch(), que sofre
 *     exatamente a mesma restrição.
 *
 * Ou seja: `file://` não é um problema de caminho, é o protocolo. Qualquer
 * arquivo HTML que carregue dados por fetch precisa de http://. */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.argv[2]) || 8080

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jsx': 'text/babel; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '')
  const file = path.resolve(ROOT, rel)

  /* Nada fora da raiz do projeto. */
  if (!file.startsWith(ROOT)) {
    res.writeHead(403).end('403 — fora da raiz do projeto')
    return
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(`404 — não achei ${rel}\n\nRode a partir da raiz do projeto:\n  node scripts/serve.mjs`)
      return
    }
    res.writeHead(200, {
      'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': stat.size,
      /* sem cache durante o desenvolvimento */
      'cache-control': 'no-cache',
    })
    fs.createReadStream(file).pipe(res)
  })
})

server.listen(PORT, () => {
  console.log(`Cadterreiros servindo em  http://localhost:${PORT}`)
  console.log(`raiz: ${ROOT}`)
  console.log('\nAbra esse endereço no Chrome. Não funciona por file:// — o fetch dos')
  console.log('dados e o carregamento do bundle exigem http.')
})
