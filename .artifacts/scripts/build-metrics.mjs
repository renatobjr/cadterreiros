/* Deriva o dataset de métricas do banco real (data/communities.json).
   Nada aqui é inventado: cada número sai dos 214 registros saneados.
   Saída: app/data/metrics.json, consumido pela página pública de mapeamento. */
import fs from 'node:fs'

const rows = JSON.parse(fs.readFileSync('data/communities.json', 'utf8'))

/* count(): agrupa por campo. `onlyReal` descarta o bucket "não informado" —
   município e bairro são usados para denominadores, e um bucket fantasma
   inflaria a contagem de cidades. */
const count = (key, onlyReal = false) => {
  const m = new Map()
  for (const r of rows) {
    const v = r[key] || 'não informado'
    if (onlyReal && v === 'não informado') continue
    m.set(v, (m.get(v) || 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(b[0], 'pt-BR'))
}

/* Fundação por década — só o que é ano plausível entra. */
const decadeOf = (y) => (y ? Math.floor(y / 10) * 10 : null)
const byDecade = new Map()
let withoutFounded = 0
for (const r of rows) {
  const d = decadeOf(r.founded)
  if (d === null) {
    withoutFounded++
    continue
  }
  byDecade.set(d, (byDecade.get(d) || 0) + 1)
}
const decades = [...byDecade.entries()]
  .sort((a, b) => a[0] - b[0])
  .map(([decade, n]) => ({ decade, label: `${decade}s`, n }))

const total = rows.length

/* Distribuição dos terreiros entre os bairros, em faixas. Diz mais do que
   só o ranking: mostra que a rede é cauda longa, não aglomerado. */
const hoodCount = new Map()
for (const r of rows) {
  const h = r.neighborhood || 'não informado'
  hoodCount.set(h, (hoodCount.get(h) || 0) + 1)
}
const hoodSizes = [...hoodCount.values()]
const hoodConcentration = [
  { label: '1 terreiro', n: hoodSizes.filter((n) => n === 1).length, key: 'b1' },
  { label: '2 terreiros', n: hoodSizes.filter((n) => n === 2).length, key: 'b2' },
  { label: '3 a 4', n: hoodSizes.filter((n) => n >= 3 && n <= 4).length, key: 'b34' },
  { label: '5 ou mais', n: hoodSizes.filter((n) => n >= 5).length, key: 'b5' },
]

/* Tipo × nação. Revela que o campo "tipo" não é uma subdivisão qualquer:
   umbanda e quimbanda são quase só "comunidade de terreiro", enquanto ketu e
   jeje são quase só "matriz africana". */
const nationByType = count('nation', true)
  .map(([nation, n]) => {
    const of = rows.filter((r) => r.nation === nation)
    return {
      nation,
      n,
      african: of.filter((r) => r.typeKey === 'african').length,
      traditional: of.filter((r) => r.typeKey === 'traditional').length,
    }
  })
  .sort((a, b) => b.n - a.n)

const metrics = {
  generatedFrom: 'data/communities.json',
  total,
  byNation: count('nation', true).map(([nation, n]) => ({ nation, n })),
  byCity: count('city', true).map(([city, n]) => ({ city, n })),
  byType: count('type', true).map(([type, n]) => ({ type, n })),
  decades,
  withoutFounded,
  hoodConcentration,
  nationByType,
  totalTakers: new Set(rows.map((r) => r.censusTaker).filter(Boolean)).size,
  municipalities: new Set(rows.map((r) => r.city).filter(Boolean)).size,
  neighborhoods: new Set(rows.map((r) => r.neighborhood).filter(Boolean)).size,
}

fs.writeFileSync('app/data/metrics.json', JSON.stringify(metrics, null, 1))

console.log('total:', total)
console.log('nações:', metrics.byNation.length, '| municípios:', metrics.byCity.length)
console.log('décadas:', decades.map((d) => `${d.label}=${d.n}`).join(' '))
console.log('sem fundação:', withoutFounded)
console.log('concentração:', hoodConcentration.map((b) => `${b.label}=${b.n}`).join(' · '))
