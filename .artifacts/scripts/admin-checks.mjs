/* Verificações das telas novas: métricas públicas e área administrativa.
   Fica em arquivo próprio e é inserido no smoke.mjs por
   scripts/insert-admin-checks.mjs. */

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
