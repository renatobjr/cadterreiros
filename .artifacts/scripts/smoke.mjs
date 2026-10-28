/* Teste de fumaça do app: sobe o HTML em jsdom, executa o bundle React real
   e percorre todas as rotas, falhando em qualquer erro de console. */
import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

/* jsdom não é dependência do projeto — é ferramenta de verificação. Resolvido
   a partir do repositório pai, onde já está instalado. */
const here = path.dirname(fileURLToPath(import.meta.url))
const rootPkg = path.resolve(here, '../../../../package.json')
const req = createRequire(fs.existsSync(rootPkg) ? rootPkg : import.meta.url)
const { JSDOM, VirtualConsole } = req('jsdom')

/* React, ReactDOM e Babel entram por CDN no index.html (contrato do runtime).
   Para o teste eles são baixados uma vez em vendor/ — mesma versão do HTML. */
const VENDOR = [
  ['react.js', 'https://unpkg.com/react@18.3.1/umd/react.production.min.js'],
  ['react-dom.js', 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'],
  ['babel.min.js', 'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js'],
]

fs.mkdirSync('vendor', { recursive: true })
for (const [name, url] of VENDOR) {
  const path = `vendor/${name}`
  if (!fs.existsSync(path)) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`não consegui baixar ${url}: ${res.status}`)
    fs.writeFileSync(path, Buffer.from(await res.arrayBuffer()))
    console.log('baixado', path)
  }
}

const errors = []
const warns = []

const vc = new VirtualConsole()
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')))
vc.on('warn', (...a) => warns.push(a.join(' ')))
vc.on('jsdomError', (e) => errors.push('jsdomError: ' + (e.message || e)))
vc.on('log', () => {})

const DATA = {
  communities: JSON.parse(fs.readFileSync('app/data/communities.json', 'utf8')),
  full: JSON.parse(fs.readFileSync('app/data/communities-full.json', 'utf8')),
  stats: JSON.parse(fs.readFileSync('app/data/stats.json', 'utf8')),
  metrics: JSON.parse(fs.readFileSync('app/data/metrics.json', 'utf8')),
}

const ROUTES = [
  '/',
  '/buscar',
  '/sobre-o-projeto',
  '/sobre-a-cciao',
  '/cadastro-voluntario',
  '/entrar',
  '/o-que-sao-comunidades-tradicionais',
  '/quais-as-linguagens-do-candomble',
  '/quais-as-nacoes-do-candomble-no-brasil',
  `/terreiro/${DATA.communities[0].slug}`,
  '/mapeamento',
  '/design-system',
  '/admin',
  '/rota-inexistente',
]

const html = fs.readFileSync('index.html', 'utf8')

const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  url: 'http://localhost/',
  virtualConsole: vc,
  /* jsdom não busca CDN por padrão; os scripts entram manualmente abaixo. */
  resources: undefined,
})

const { window } = dom

/* jsdom não faz fetch; servimos os JSON que o app carrega e o CSS de tokens.
   A página /design-system lê tokens.css em runtime para mostrar os valores de
   verdade — sem esse fetch ela cairia no estado degradado e o smoke não
   verificaria nada da página. */
window.fetch = async (url) => {
  const key = String(url).replace(/^\.?\//, '').split('?')[0]
  const map = {
    'app/data/communities.json': DATA.communities,
    'app/data/communities-full.json': DATA.full,
    'app/data/stats.json': DATA.stats,
    'app/data/metrics.json': DATA.metrics,
  }
  if (key === 'assets/css/tokens.css') {
    const text = fs.readFileSync(key, 'utf8')
    return { ok: true, text: async () => text }
  }
  const body = map[key]
  if (!body) {
    errors.push(`fetch inesperado: ${url}`)
    return { ok: false, json: async () => ({}) }
  }
  return { ok: true, json: async () => body }
}

/* jsdom não implementa scrollTo e registra isso como jsdomError. */
window.scrollTo = () => {}

const settle = (ms = 320) => new Promise((r) => setTimeout(r, ms))

/* Os scripts são avaliados dentro da própria janela do jsdom, que já tem
   self/window/XMLHttpRequest e o DOM — sem polyfill manual. */
window.eval(fs.readFileSync('vendor/react.js', 'utf8'))
window.eval(fs.readFileSync('vendor/react-dom.js', 'utf8'))
window.eval(fs.readFileSync('vendor/babel.min.js', 'utf8'))

const Babel = window.Babel
if (!Babel) {
  console.log('ERRO: Babel não carregou na janela.')
  process.exit(1)
}

const transformed = Babel.transform(fs.readFileSync('app/bundle.jsx', 'utf8'), {
  presets: ['react'],
}).code

/* Exposto para o teste poder chamar o roteador da aplicação. */
window.eval(
  `window.__req = __req;\n${transformed}`,
)

const router = window.__req('app/router.js')

await settle()
console.log('render inicial: ok')

const root = window.document.getElementById('root')
if (!root || root.innerHTML.trim().length < 200) {
  errors.push('root vazio após o primeiro render')
} else {
  console.log(`root renderizado: ${root.innerHTML.length} caracteres`)
}

/* Percorre as rotas pelo roteador real da aplicação. */
let visited = 0
for (const route of ROUTES) {
  try {
    router.navigate(route)
    await settle()
    const len = root.innerHTML.length
    if (len < 200) errors.push(`rota ${route}: conteúdo vazio`)
    visited++
  } catch (e) {
    errors.push(`rota ${route}: ${e.message}`)
  }
}
console.log(`rotas percorridas: ${visited}/${ROUTES.length}`)

/* ---------- interações: digitar, filtrar, ordenar, paginar, submit ---------- */

const $ = (sel) => window.document.querySelector(sel)
const $$ = (sel) => [...window.document.querySelectorAll(sel)]
const click = (el) => {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }))
}
/* React escuta 'input' nos campos controlados. O setter precisa vir do
   protótipo do tipo real do elemento (input, textarea, select). */
const protoFor = (el) =>
  el.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype
    : el.tagName === 'SELECT'
      ? window.HTMLSelectElement.prototype
      : window.HTMLInputElement.prototype

const typeInto = (el, value) => {
  if (!el) throw new Error('typeInto: elemento não encontrado')
  Object.getOwnPropertyDescriptor(protoFor(el), 'value').set.call(el, value)
  el.dispatchEvent(new window.Event('input', { bubbles: true }))
}
const choose = (el, value) => {
  if (!el) throw new Error('choose: elemento não encontrado')
  Object.getOwnPropertyDescriptor(protoFor(el), 'value').set.call(el, value)
  el.dispatchEvent(new window.Event('change', { bubbles: true }))
}

const rowCount = () => $$('table.data tbody tr').length

/* 1. Busca por nome real */
router.navigate('/buscar')
await settle()
const sample = DATA.communities.find((c) => c.typeKey === 'african' && c.founded)
const term = sample.name.split(' ').slice(1, 3).join(' ')
typeInto($('#q'), term)
await settle()
const hits = rowCount()
if (hits < 1) errors.push(`busca "${term}" não retornou nenhum resultado`)
if (hits >= DATA.stats.total) errors.push('filtro de texto não filtrou nada')
console.log(`busca "${term}": ${hits} linha(s)`)

/* 2. Busca sem acento precisa achar termo com acento */
typeInto($('#q'), sample.name.normalize('NFD').replace(/[̀-ͯ]/g, ''))
await settle()
if (rowCount() < 1) errors.push('busca sem acento não encontrou o termo com acento')
console.log(`busca sem acento: ${rowCount()} linha(s)`)

/* 3. Filtro por nação devolve só aquela nação */
typeInto($('#q'), '')
choose($('#nacao'), 'nago')
await settle()
const nationsShown = new Set(
  $$('table.data tbody tr')
    .map((tr) => tr.children[1].textContent.trim())
    .filter(Boolean),
)
if (nationsShown.size > 1) errors.push(`filtro de nação misturou: ${[...nationsShown]}`)
if (rowCount() < 1) errors.push('filtro de nação não retornou linhas')
console.log(`filtro nação=nago: ${rowCount()} linha(s), nações=${[...nationsShown]}`)
choose($('#nacao'), '')
await settle()

/* 4. Ordenação */
const firstAsc = $$('table.data tbody tr')[0].children[0].textContent.trim()
const sortBtn = $$('table.data thead .sortbtn')[0]
click(sortBtn)
await settle()
const firstDesc = $$('table.data tbody tr')[0].children[0].textContent.trim()
if (firstAsc === firstDesc) errors.push('ordenar não alterou a ordem da tabela')
console.log(`ordenar: "${firstAsc}" → "${firstDesc}"`)

/* 5. Paginação */
click(sortBtn)
await settle()
const pageBefore = $$('.pager__btn')[0].disabled
const page2Before = $$('table.data tbody tr')[0].children[0].textContent.trim()
click($$('.pager__btn')[1])
await settle()
const page2After = $$('table.data tbody tr')[0].children[0].textContent.trim()
if (!pageBefore) errors.push('botão Anterior deveria estar desabilitado na página 1')
if (page2Before === page2After) errors.push('paginação não mudou o conteúdo')
console.log(`paginação: página 1 "${page2Before}" → página 2 "${page2After}"`)

/* 6. Estado vazio e limpeza de filtros */
typeInto($('#q'), 'zzzznaoexiste')
await settle()
if (!$('.empty')) errors.push('estado vazio não apareceu para termo inexistente')
click($('.empty .btn'))
await settle()
if (rowCount() < 1) errors.push('limpar filtros não restaurou a lista')
console.log(`limpar filtros: ${rowCount()} linha(s)`)

/* 7. Troca de aba lista → mapa */
const tabMap = $$('.tab').find((t) => t.textContent.trim() === 'Mapa')
click(tabMap)
await settle()
const pins = $$('.mapbox__pin').length
if (pins < 1) errors.push('aba mapa não renderizou marcadores')
console.log(`aba mapa: ${pins} marcadores`)

/* 8. Validação do formulário de cadastro bloqueia envio vazio */
router.navigate('/cadastro-voluntario')
await settle()
click($$('.btn--primary').find((b) => b.textContent.includes('Continuar')))
await settle()
const errs1 = $$('span').filter((s) => /Informe|Escolha/.test(s.textContent)).length
if (errs1 < 1) errors.push('cadastro: primeira etapa não exibiu erros de validação')
console.log(`cadastro etapa 1 sem preencher: ${errs1} erro(s) exibidos`)

/* 9. Preenche e avança as três etapas */
typeInto($('#name'), 'Templo de Teste da Fumaça')
choose($('#typeKey'), 'african')
choose($('#nationKey'), 'nago')
typeInto($('#founded'), '1998')
click($$('.btn--primary').find((b) => b.textContent.includes('Continuar')))
await settle()
if (!$('#address')) errors.push('cadastro: não avançou para a etapa 2')
typeInto($('#address'), 'Rua de Teste, 123')
typeInto($('#neighborhood'), 'Torre')
choose($('#city'), 'João Pessoa')
click($$('.btn--primary').find((b) => b.textContent.includes('Continuar')))
await settle()
if (!$('#bio')) errors.push('cadastro: não avançou para a etapa 3')
typeInto($('#leader'), 'Liderança de Teste')
typeInto($('#phone'), '83988887777')
typeInto($('#email'), 'teste@exemplo.org')
typeInto(
  $('#bio'),
  'Relato de teste com comprimento suficiente para passar da validação mínima do formulário.',
)

/* Enviar sem o consentimento precisa ser barrado. */
click($$('.btn--primary').find((b) => b.textContent.includes('Enviar')))
await settle()
const consentErr = $$('span').some((s) => /autorizar a publicação/i.test(s.textContent))
if (!consentErr) errors.push('cadastro: envio sem consentimento deveria falhar')
if ($('[data-od-id="cadastro-enviado"]'))
  errors.push('cadastro: enviou sem consentimento')
console.log(`cadastro: envio sem consentimento barrado = ${consentErr}`)

/* Marca o consentimento e envia de verdade. */
  const consentBox = $('input[type="checkbox"]')
  if (!consentBox) {
    errors.push('cadastro: checkbox de consentimento não encontrado')
  } else {
    /* onChange de checkbox no React dispara em 'click'. */
    consentBox.click()
    await settle()
    if (!consentBox.checked) errors.push('cadastro: consentimento não marcou')
  click($$('.btn--primary').find((b) => b.textContent.includes('Enviar')))
  await settle()
  if (!$('[data-od-id="cadastro-enviado"]'))
    errors.push('cadastro: envio válido não chegou à confirmação')
  else console.log('cadastro: confirmação exibida com protocolo')
}

/* 10. Login: e-mail inválido e válido */
router.navigate('/entrar')
await settle()
typeInto($('#email'), 'nao-e-email')
typeInto($('#pass'), 'senhaforte')
click($('button[type="submit"]'))
await settle()
if (!$('.auth__err')) errors.push('login: e-mail inválido não mostrou erro')
typeInto($('#email'), 'equipe@cciao.org')
click($('button[type="submit"]'))
await settle()
if (!$('#otp')) errors.push('login: não avançou para o código de verificação')
/* A partir daqui a tela entrega o admin — o ciclo completo de login com
   código é verificado no bloco 15, que precisa partir sem sessão. */
window.localStorage.removeItem('cadterreiros.session')
console.log('login: e-mail inválido barrado, válido avançou ao OTP')

/* Verifica que os dados reais chegaram à tela. Checagem por rota, porque
   cada tela mostra recortes diferentes do mesmo banco. */
const byId = DATA.full || {}
const first = DATA.communities[0]
const firstFull = byId[first.id] || first

const contentChecks = [
  ['/', [String(DATA.stats.total), String(DATA.stats.neighborhoods), 'nações']],
  ['/buscar', [first.name, first.nation, String(DATA.stats.total)]],
  [
    `/terreiro/${first.slug}`,
    [firstFull.name, firstFull.nation, String(firstFull.founded || '')],
  ],
  ['/sobre-o-projeto', ['BRA/15/010', 'CCIAO', 'matriz africana']],
  ['/cadastro-voluntario', ['Cadastre um terreiro', 'Nação da tradição']],
  ['/quais-as-nacoes-do-candomble-no-brasil', ['Umbanda', 'Nagô']],
  /* A página de referência precisa mostrar os tokens REAIS, lidos do CSS.
     Se ela cair no estado degradado ("Carregando tokens…"), os marcadores
     abaixo não aparecem e o smoke acusa. */
  ['/design-system', [
    'Sistema visual',
    '--accent',
    'oklch(46% 0.155 35)',
    'persimmon — CTA e estado ativo',
    'Nome do terreiro',
    'Sobre superfície escura',
    'Não editar',
  ]],
]

for (const [route, needles] of contentChecks) {
  router.navigate(route)
  await settle()
  const t = window.document.getElementById('root').textContent || ''
  for (const needle of needles) {
    if (!needle) continue
    if (!t.includes(needle)) {
      errors.push(`conteúdo ausente em ${route}: "${needle}"`)
    }
  }
}
console.log(`conteúdo verificado em ${contentChecks.length} rotas`)

const METRICS = DATA.metrics
const local = (k) => JSON.parse(window.localStorage.getItem(k) || 'null')

/* --- 13. Métricas: gráficos com preenchimento real --- */
router.navigate('/mapeamento')
await settle()

const bars = $$('.bar__fill')
const histo = $$('.histo__fill')
const segs = $$('.stackbar__seg')
console.log(
  `mapeamento: ${bars.length} barras · ${histo.length} colunas de década · ${segs.length} segmentos empilhados`,
)

if (bars.length < 10) errors.push('mapeamento: gráfico de barras quase vazio')
if (histo.length < 5) errors.push('mapeamento: histograma de décadas vazio')
if (segs.length < 8) errors.push('mapeamento: barra empilhada tipo×nação incompleta')

/* Preenchimento real: nenhuma barra visível pode ter espessura zero. */
const zeroWidth = [...bars, ...histo, ...segs].filter((el) => {
  const v = el.style.width || el.style.height
  return !v || parseFloat(v) <= 0
})
if (zeroWidth.length) {
  errors.push(`mapeamento: ${zeroWidth.length} barra(s) com preenchimento zero`)
}

const mapText = window.document.getElementById('root').textContent || ''
for (const needle of [
  String(METRICS.total),
  String(METRICS.neighborhoods),
  String(METRICS.municipalities),
  String(METRICS.totalTakers),
]) {
  if (!mapText.includes(needle)) {
    errors.push(`mapeamento: métrica ausente na tela "${needle}"`)
  }
}

/* O total de cada série tem que fechar com os 214 registros. */
const nationSum = METRICS.byNation.reduce((a, b) => a + b.n, 0)
if (nationSum !== METRICS.total) {
  errors.push(`mapeamento: nações somam ${nationSum}, esperado ${METRICS.total}`)
}
const decadeSum = METRICS.decades.reduce((a, b) => a + b.n, 0)
if (decadeSum + METRICS.withoutFounded !== METRICS.total) {
  errors.push(
    `mapeamento: décadas(${decadeSum}) + sem ano(${METRICS.withoutFounded}) != ${METRICS.total}`,
  )
}
console.log(
  `mapeamento: nações=${nationSum} · décadas=${decadeSum} + ${METRICS.withoutFounded} sem ano = ${METRICS.total}`,
)

/* Concentração: as faixas têm de fechar nos bairros mapeados. */
const hoodSum = METRICS.hoodConcentration.reduce((a, b) => a + b.n, 0)
if (hoodSum !== METRICS.neighborhoods) {
  errors.push(
    `mapeamento: faixas de bairro somam ${hoodSum}, esperado ${METRICS.neighborhoods}`,
  )
}

/* Tipo × nação: cada linha tem de fechar no total da nação. */
const badRows = METRICS.nationByType.filter((r) => r.african + r.traditional !== r.n)
if (badRows.length) {
  errors.push(
    `mapeamento: ${badRows.length} nação(ões) com tipo que não fecha no total`,
  )
}
const typeSum = METRICS.nationByType.reduce((a, b) => a + b.african + b.traditional, 0)
if (typeSum !== METRICS.total) {
  errors.push(`mapeamento: tipo×nação soma ${typeSum}, esperado ${METRICS.total}`)
}

/* A tela não pode continuar exibindo os painéis removidos. */
const mapHtml = window.document.getElementById('root').textContent || ''
for (const gone of ['Cobertura do registro', 'Recenseadores', 'O que a base tem']) {
  if (mapHtml.includes(gone)) {
    errors.push(`mapeamento: painel removido ainda aparece ("${gone}")`)
  }
}
for (const kept of ['cauda longa', 'O tipo varia por nação']) {
  if (!mapHtml.includes(kept)) {
    errors.push(`mapeamento: painel novo ausente ("${kept}")`)
  }
}
console.log(
  `mapeamento: bairros=${hoodSum} · tipo×nação=${typeSum}`,
)

/* --- 14. Admin sem sessão: acesso negado, não 404 --- */
router.navigate('/admin')
await settle()
let adminText = window.document.getElementById('root').textContent || ''
if (!/Só para a equipe da CCIAO/.test(adminText)) {
  errors.push('admin: sem sessão não mostrou acesso negado')
}
console.log('admin sem sessão: acesso negado ok')

/* --- 15. Login abre sessão e entrega o admin --- */
router.navigate('/entrar')
await settle()
typeInto($('#email'), 'equipe@cciao.org')
typeInto($('#pass'), 'senhaforte')
click($('button[type="submit"]'))
await settle()
typeInto($('#otp'), '1234')
click($('button[type="submit"]'))
await settle()
adminText = window.document.getElementById('root').textContent || ''
if (!/Olá, equipe/.test(adminText)) {
  errors.push('admin: login não abriu sessão com o usuário esperado')
}
if (!$('.adminbar')) errors.push('admin: barra de área restrita ausente')
console.log('login → sessão → /admin ok')

/* --- 16. Fila de revisão traz pendências reais da base --- */
const issueRows = $$('table.data tbody tr').length
if (issueRows < 1) errors.push('admin: fila vazia, esperava pendências reais')
console.log(`admin: ${issueRows} linha(s) na fila de revisão`)

if (
  !/ano de fundação não informado|município em branco|linguagens não registradas/.test(
    adminText,
  )
) {
  errors.push('admin: fila não mostra o motivo da pendência')
}

/* --- 17. Ciclo completo: cadastro público → fila → aprovação --- */
window.localStorage.removeItem('cadterreiros.submissions')

router.navigate('/cadastro-voluntario')
await settle()
typeInto($('#name'), 'T Terreiro do Ciclo Completo')
choose($('#typeKey'), 'african')
choose($('#nationKey'), 'nago')
typeInto($('#founded'), '1997')
click($$('.btn--primary').find((b) => b.textContent.includes('Continuar')))
await settle()
typeInto($('#address'), 'Rua do Teste, 1')
typeInto($('#neighborhood'), 'Torre')
choose($('#city'), 'João Pessoa')
click($$('.btn--primary').find((b) => b.textContent.includes('Continuar')))
await settle()
typeInto($('#leader'), 'Liderança do Ciclo')
typeInto(
  $('#bio'),
  'Relato do terreiro do ciclo completo, com comprimento suficiente para a validação mínima do formulário.',
)
/* O envio é barrado sem o consentimento de publicação — o ciclo precisa
   marcá-lo, senão está testando o caminho de erro. */
const consent = $('#consent')
if (!consent) {
  errors.push('ciclo: checkbox de consentimento não encontrado')
} else {
  consent.click()
  await settle()
}
click($$('.btn--primary').find((b) => b.textContent.includes('Enviar')))
await settle()
if (!$('[data-od-id="cadastro-enviado"]')) {
  errors.push('ciclo: cadastro público não confirmou o envio')
}

const stored = local('cadterreiros.submissions') || []
if (stored.length !== 1) errors.push(`ciclo: esperado 1 cadastro, há ${stored.length}`)
if (stored[0] && stored[0].status !== 'pending') {
  errors.push(`ciclo: gravado como "${stored[0].status}", esperado "pending"`)
}
console.log(`ciclo: cadastro gravado como ${stored[0]?.id} (${stored[0]?.status})`)

/* o protocolo mostrado tem de ser o id real do registro gravado */
const confirmText = window.document.getElementById('root').textContent || ''
if (stored[0] && !confirmText.includes(stored[0].id)) {
  errors.push('ciclo: protocolo exibido não é o id do registro gravado')
}

router.navigate('/admin')
await settle()
adminText = window.document.getElementById('root').textContent || ''
if (!adminText.includes('T Terreiro do Ciclo Completo')) {
  errors.push('ciclo: cadastro enviado não apareceu na fila do admin')
}
console.log('ciclo: cadastro visível na fila do admin')

/* aprovar exige confirmação e persiste a decisão */
const approveBtn = $$('table.data .btn--primary').find((b) =>
  b.textContent.includes('Aprovar'),
)
if (!approveBtn) {
  errors.push('ciclo: botão Aprovar não encontrado')
} else {
  click(approveBtn)
  await settle()
  if (!$('.modal')) errors.push('ciclo: aprovar não exigiu confirmação')
  click($$('.modal .btn--primary').find((b) => b.textContent.includes('Aprovar')))
  await settle()
  const after = local('cadterreiros.submissions') || []
  if (after[0]?.status !== 'approved') {
    errors.push(`ciclo: status após aprovar = "${after[0]?.status}"`)
  }
  console.log('ciclo: aprovado com confirmação e persistido')
}

/* aba de aprovados mostra o registro */
const tabAprovados = $$('.tab').find((t) => t.textContent.includes('aprovados'))
if (tabAprovados) {
  click(tabAprovados)
  await settle()
  const t = window.document.getElementById('root').textContent || ''
  if (!t.includes('T Terreiro do Ciclo Completo')) {
    errors.push('ciclo: registro aprovado não aparece na aba de aprovados')
  }
  console.log('ciclo: registro na aba de aprovados')
}

/* --- 18. Edição de registro real e descarte --- */
const tabBase = $$('.tab').find((t) => t.textContent.includes('Todos os'))
click(tabBase)
await settle()
const firstEdit = $$('table.data .btn--ghost').find((b) =>
  b.textContent.includes('Editar'),
)
if (!firstEdit) {
  errors.push('admin: aba da base sem botão de editar')
} else {
  click(firstEdit)
  await settle()
  if (!$('.modal')) errors.push('admin: edição não abriu diálogo')
  const original = $('#e-name') ? $('#e-name').value : ''
  typeInto($('#e-name'), `${original} [editado]`)
  click($$('.modal .btn--primary').find((b) => b.textContent.includes('Salvar')))
  await settle()
  const ov = local('cadterreiros.overrides') || {}
  if (!Object.keys(ov).length) errors.push('admin: edição não persistiu override')

  const discard = $$('.btn--ghost').find((b) => b.textContent.includes('Descartar'))
  if (!discard) {
    errors.push('admin: sem botão para descartar edições locais')
  } else {
    click(discard)
    await settle()
    if (Object.keys(local('cadterreiros.overrides') || {}).length) {
      errors.push('admin: descartar edições não limpou o overlay')
    }
    console.log('admin: edição de registro real + descarte ok')
  }
}

/* --- 19. Sair volta a bloquear o admin --- */
click($$('.btn--ghost').find((b) => b.textContent.includes('Sair')))
await settle()
router.navigate('/admin')
await settle()
adminText = window.document.getElementById('root').textContent || ''
if (!/Só para a equipe da CCIAO/.test(adminText)) {
  errors.push('admin: sair não encerrou a sessão')
}
console.log('admin: sessão encerrada ok')

if (errors.length) {
  console.log('\nERROS:')
  for (const e of errors) console.log(' -', e)
  process.exit(1)
}
if (warns.length) {
  console.log('\nWARNINGS:')
  for (const w of warns.slice(0, 10)) console.log(' -', w)
}
console.log('\nOK: sem erros de console em todas as rotas.')
