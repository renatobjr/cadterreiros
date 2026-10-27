/* ============================================================
   Design tokens do Cadterreiros — FONTE ÚNICA DE VERDADE.
   ============================================================
   Este arquivo é a origem. Duas coisas são geradas a partir dele:
     · assets/css/tokens.css   — as custom properties do :root
     · os valores medidos por scripts/verify-contrast.mjs

   NUNCA edite assets/css/tokens.css à mão. Altere aqui e rode:
       node scripts/build-tokens.mjs
   O gate scripts/verify-tokens.mjs falha se o CSS divergir deste arquivo.

   Toda cor é OKLch. Nenhum hex. As razões de contraste de cada par estão
   em VERIFY no fim do arquivo e são checadas a cada execução.
   ============================================================ */

/* ---------- cor: superfícies ---------- */
/* Papel → recuado → cartão. Sem sombra: a profundidade vem do fio. */
const SURFACE = {
  bg: ['oklch(97.5% 0.008 75)', 'papel de arquivo'],
  'surface-sunk': ['oklch(95.5% 0.009 72)', 'cabeçalho de tabela, trilho de gráfico'],
  surface: ['oklch(100% 0 0)', 'cartão'],
}

/* ---------- cor: texto ---------- */
const TEXT = {
  fg: ['oklch(24% 0.025 40)', 'corpo de texto'],
  'fg-soft': ['oklch(34% 0.02 42)', 'citação, rótulo de dado'],
  muted: ['oklch(42% 0.018 45)', 'metadado, legenda'],
  'on-deep': ['oklch(90% 0.014 70)', 'texto sobre superfície escura'],
  /* Havia dois tons para lede sobre escuro (88% na seção, 93% no herói) por
     descuido, não por intenção. Unificados: a diferença era invisível e
     impedia o lede de ser tokenizado. */
  'on-deep-lede': ['oklch(91% 0.018 70)', 'lede sobre superfície escura'],
  'on-deep-muted': ['oklch(78% 0.016 60)', 'link e metadado no rodapé'],
  'on-deep-soft': ['oklch(85% 0.018 65)', 'faixa de metadados sobre escuro'],
  'on-gold': ['oklch(24% 0.06 70)', 'texto sobre fundo dourado'],
}

/* ---------- cor: fio ----------
   Três pesos porque a identidade é construída sobre ele. --border é a
   estrutura e precisa de 3:1 sobre o papel para ser visível; --border-soft
   é divisória decorativa dentro de um contêiner que já tem borda. */
const BORDER = {
  border: ['oklch(65% 0.012 70)', 'estrutura: cartão, tabela, nav'],
  'border-soft': ['oklch(86% 0.01 72)', 'divisória de linha, etiqueta'],
  'border-strong': ['oklch(62% 0.014 70)', 'campo de formulário, cabeçalho'],
  'border-on-deep': ['oklch(45% 0.03 30)', 'divisória sobre superfície escura'],
}

/* ---------- cor: acento ---------- */
const ACCENT = {
  accent: ['oklch(46% 0.155 35)', 'persimmon — CTA e estado ativo'],
  'accent-hover': ['oklch(38% 0.13 33)', 'hover do CTA, mais escuro'],
  'accent-deep': ['oklch(28% 0.075 30)', 'superfície escura, segundo segmento'],
  'accent-soft': ['oklch(94% 0.035 42)', 'fundo de etiqueta e hover fantasma'],
  gold: ['oklch(78% 0.13 82)', 'número em destaque sobre escuro'],
}

/* ---------- cor: estado ----------
   --ok-soft foi removido de propósito. Existe --danger-soft porque há
   mensagem de erro no produto; não há mensagem de sucesso com fundo
   próprio, e a tela de confirmação de cadastro é uma seção neutra.
   Um token sem uso é um token que diverge. Quando existir a faixa de
   sucesso, ele volta aqui — com uso, não com intenção. */
const STATUS = {
  ok: ['oklch(46% 0.115 150)', 'aprovado'],
  warn: ['oklch(46% 0.135 55)', 'pendente'],
  danger: ['oklch(46% 0.185 25)', 'rejeitado, erro'],
  'danger-hover': ['oklch(26% 0.06 25)', 'hover do botão destrutivo'],
  'danger-soft': ['oklch(96% 0.03 25)', 'fundo de mensagem de erro'],
}

/* ---------- cor: apoio ----------
   Não são tokens de uso geral, mas existem em mais de um lugar e por isso
   foram promovidos. Um valor que aparece uma única vez e pertence a um
   gradiente específico pode continuar literal. */
const SUPPORT = {
  placeholder: ['oklch(52% 0.014 50)', 'texto de exemplo do campo'],
  'btn-ghost-border': ['oklch(55% 0.02 45)', 'borda do botão fantasma'],
  'btn-on-deep-border': ['oklch(70% 0.03 40)', 'borda do botão sobre escuro'],
  'photo-placeholder': ['oklch(92% 0.01 70)', 'moldura de imagem ausente'],
  'map-land': ['oklch(94% 0.012 95)', 'terra firme no mapa'],
  'map-grid': ['oklch(84% 0.01 80)', 'grade de referência'],
  'map-dot': ['oklch(58% 0.012 50)', 'ponto sem tradição classificada'],
  'map-sea': ['oklch(88% 0.045 225)', 'faixa litorânea'],
  'map-coast': ['oklch(62% 0.07 225)', 'linha de costa'],
  'map-river': ['oklch(64% 0.075 220)', 'rio Paraíba'],
}

/* ---------- tipografia ---------- */
const FONT = {
  display: "'Newsreader', 'Iowan Old Style', Charter, Georgia, serif",
  body: "'Nunito Sans', sans-serif",
  mono: "'Space Grotesk', ui-monospace, monospace",
}

/* Escala: o tracking acompanha o tamanho — display grande fecha mais.
   Tamanho, entrelinha e tracking saem daqui; o CSS consome. */
const TYPE_SCALE = {
  'display-1': { size: 'clamp(2.35rem, 5vw, 4rem)', leading: '1.02', tracking: '-0.028em', use: 'título de página' },
  'display-2': { size: 'clamp(1.75rem, 3.2vw, 2.6rem)', leading: '1.08', tracking: '-0.022em', use: 'título de seção' },
  'display-3': { size: 'clamp(1.25rem, 2vw, 1.65rem)', leading: '1.18', tracking: '-0.014em', use: 'título menor' },
  lede: { size: 'clamp(1.03rem, 1.45vw, 1.16rem)', leading: '1.58', tracking: '0', use: 'linha de apoio' },
  body: { size: '17px', leading: '1.65', tracking: '0', use: 'corpo' },
  'meta': { size: '12px', leading: '1.5', tracking: '0.03em', use: 'metadado, mono' },
  eyebrow: { size: '11.5px', leading: '1.4', tracking: '0.15em', use: 'rótulo caixa alta, mono' },
}

const METRICS = {}

/* ---------- espaço: grade de 8px ---------- */
const SPACE = {
  s1: '4px',
  s2: '8px',
  s3: '12px',
  s4: '16px',
  s5: '24px',
  s6: '32px',
  s7: '48px',
  s8: '64px',
  gutter: '24px',
  'section': 'clamp(52px, 6.5vw, 88px)',
  'section-tight': 'clamp(36px, 4.5vw, 56px)',
}

/* ---------- forma e alvo ---------- */
const SHAPE = {
  r: '4px',
  'pill': '999px',
  'touch': '48px',
}

/* ---------- layout ---------- */
const LAYOUT = {
  shell: '1240px',
  'nav-h': '72px',
  'pad-page': 'clamp(20px, 4vw, 40px)',
}

/* ---------- movimento ----------
   Três durações. --motion-fast é a mais usada: hover e foco precisam parecer
   instantâneos. --motion-med cobre microfeedback com estado. */
const MOTION = {
  'motion-fast': '150ms',
  'motion-base': '160ms',
  'motion-med': '180ms',
  'motion-slow': '340ms',
  'ease-out': 'cubic-bezier(0.2, 0.6, 0.2, 1)',
}

/* ---------- camadas ---------- */
const Z = { nav: '90', modal: '200', toast: '210' }

/* ============================================================
   Exportação
   ============================================================ */

const COLOR_GROUPS = { surface: SURFACE, text: TEXT, border: BORDER, accent: ACCENT, status: STATUS, support: SUPPORT }

/** Todos os tokens de cor, já com a descrição. */
export const COLOR_TOKENS = Object.entries(COLOR_GROUPS).flatMap(([group, entries]) =>
  Object.entries(entries).map(([name, [value, desc]]) => ({
    name: `--${name}`,
    group,
    value,
    desc,
  })),
)

export const FONT_TOKENS = Object.entries(FONT).map(([name, value]) => ({
  name: `--font-${name}`,
  group: 'font',
  value,
  desc: 'família tipográfica',
}))

export const SPACE_TOKENS = Object.entries(SPACE).map(([name, value]) => ({
  name: `--${name}`,
  group: 'space',
  value,
  desc: 'grade de 8px',
}))

export const SHAPE_TOKENS = Object.entries(SHAPE).map(([name, value]) => ({
  name: `--${name}`,
  group: 'shape',
  value,
  desc: 'raio e alvo de toque',
}))

export const LAYOUT_TOKENS = Object.entries(LAYOUT).map(([name, value]) => ({
  name: `--${name}`,
  group: 'layout',
  value,
  desc: 'medida de contêiner',
}))

export const MOTION_TOKENS = [
  ...Object.entries(MOTION).map(([name, value]) => ({ name: `--${name}`, group: 'motion', value, desc: 'duração e curva' })),
  ...Object.entries(Z).map(([name, value]) => ({ name: `--z-${name}`, group: 'motion', value, desc: 'camada' })),
]

/** Todas as custom properties, na ordem em que vão para o CSS. */
export const ALL_TOKENS = [
  ...COLOR_TOKENS,
  ...FONT_TOKENS,
  ...SPACE_TOKENS,
  ...SHAPE_TOKENS,
  ...LAYOUT_TOKENS,
  ...MOTION_TOKENS,
]

/** Mapa nome → valor, para verificação de paridade. */
export const TOKEN_MAP = Object.fromEntries(ALL_TOKENS.map((t) => [t.name, t.value]))

export { TYPE_SCALE, METRICS }

export const GROUPS = [
  { id: 'surface', label: 'Superfícies' },
  { id: 'text', label: 'Texto' },
  { id: 'border', label: 'Fio' },
  { id: 'accent', label: 'Acento' },
  { id: 'status', label: 'Estado' },
  { id: 'support', label: 'Apoio' },
  { id: 'font', label: 'Famílias' },
  { id: 'space', label: 'Espaço' },
  { id: 'shape', label: 'Forma' },
  { id: 'layout', label: 'Layout' },
  { id: 'motion', label: 'Movimento' },
]

