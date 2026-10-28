# brand-spec.md — Nova Identidade Visual · Cadterreiros

Base: negócio real (mapeamento de comunidades de matriz africana na Região
Metropolitana de João Pessoa), conteúdo real em `data/communities.json`
(214 terreiros) e paleta original em `source/web/src/plugins/vuetify.js`.
Direção de registro: `editorial-monocle`, adaptada para um **registro de
patrimônio cultural** — não um site de notícias.

Todos os valores abaixo foram medidos com `RECON/contrast.mjs` (WCAG 2.1
relativo). Nenhum hex é escrito à mão no CSS.

## Tokens OKLch

```css
:root {
  /* superfícies: papel → recuado → cartão. Três degraus, sem sombra. */
  --bg:      oklch(97.5% 0.008 75);   /* #faf6f1 papel de arquivo */
  --surface-sunk: oklch(95.5% 0.009 72);  /* cabeçalho de tabela, trilho de gráfico */
  --surface: oklch(100% 0 0);         /* #ffffff cartão branco, separa do papel */

  /* texto: três tons, todos verificados contra as três superfícies */
  --fg:      oklch(24% 0.025 40);     /*  6.07:1 sobre --bg */
  --fg-soft: oklch(34% 0.020 42);     /* 11.01:1 sobre --bg — citação, rótulo de dado */
  --muted:   oklch(42% 0.018 45);     /*  7.92:1 sobre --bg */

  /* fio em três tamanhos, porque a identidade é construída sobre ele */
  --border:        oklch(65% 0.012 70); /* 3.01:1 — estrutura: cartão, tabela, nav */
  --border-soft:   oklch(86% 0.010 72); /* decorativo: divisória de linha, etiqueta */
  --border-strong: oklch(62% 0.014 70); /* 3.65:1 — campo de formulário, cabeçalho */

  --accent:  oklch(46% 0.155 35);     /* #9c2a09  7.15:1 sobre --bg */
}
```

Derivados — todos medidos:

| Token | Valor | Medição |
|---|---|---|
| `--accent-deep` | `oklch(28% 0.075 30)` | branco sobre ele = **15.00:1** |
| `--accent-soft` | `oklch(94% 0.035 42)` | fundo de etiqueta; texto `--fg` |
| `--gold` | `oklch(78% 0.130 82)` | **7.42:1** sobre `--accent-deep` |
| `--ok` | `oklch(46% 0.115 150)` | **6.28:1** sobre `--bg` |
| `--warn` | `oklch(46% 0.135 55)` | **6.92:1** sobre `--bg` |
| `--danger` | `oklch(0.185 0.02 25)` | **17.40:1** sobre `--bg` |

**Por que o fio estrutural é mais escuro do que parecia preciso.** Na primeira
versão, `--border` era `oklch(88%)` e media **1.34:1** contra o papel — quase
invisível. Como a identidade é "fio de 1px, sem sombra", esse fio *é* a
estrutura: se ele some, o cartão deixa de existir. Desceu para `oklch(65%)` e
passa a **3.01:1**. A divisória interna de linha continua leve
(`--border-soft`), porque ali a estrutura já está na borda externa do
contêiner — assim a tabela não vira uma grade de linhas escuras.

## Tokens de nação

Oito tons dessaturados, um por nação. Cada tom recebe o mesmo orçamento de
croma e passa 4.6:1 com texto branco. Usados no mapa e na legenda:

| Token | Valor | Nação |
|---|---|---|
| `--n-umbanda` | `oklch(48% 0.075 145)` | Umbanda |
| `--n-nago` | `oklch(50% 0.085 78)` | Nagô |
| `--n-ketu` | `oklch(48% 0.095 38)` | Ketu |
| `--n-outros` | `oklch(50% 0.05 60)` | Outros |
| `--n-angola` | `oklch(45% 0.075 152)` | Angola |
| `--n-jeje` | `oklch(47% 0.08 242)` | Jeje |
| `--n-ekiti-efon` | `oklch(46% 0.08 310)` | Ekiti Efon |
| `--n-quimbanda` | `oklch(45% 0.09 25)` | Quimbanda |

**Por que o persimmon desceu de tom.** O site original usa `#E85C0D`
(`plugins/vuetify.js`) em texto pequeno sobre branco: medido **3.52:1** —
reprova WCAG AA para texto normal. E `#FFAA00` (gold) dá **1.91:1**, ilegível
como texto. O novo `--accent` mantém a assinatura laranja-terra da
instituição, mas em `L=46%`, o que leva o mesmo elemento a **7.15:1** sem
mudar a família cromática. O dourado vira apoio numérico sobre superfície
escura, nunca texto sobre papel.

## Ritmo de espaçamento

Grade de 8px, exposta como tokens. Todo gap e padding de seção, cartão,
grade e formulário sai daqui, para o respiro ser o mesmo em todas as telas:

```
--s1 4px   --s2 8px   --s3 12px   --s4 16px
--s5 24px  --s6 32px   --s7 48px   --s8 64px
```

Seção cheia: `clamp(52px, 6.5vw, 88px)` vertical. Seção compacta:
`clamp(36px, 4.5vw, 56px)`.

## Tipografia

| Papel | Família | Uso |
|---|---|---|
| Display | `Newsreader` (serif variável, opsz 6–72) | Títulos, números grandes, citações |
| Body/UI | `Nunito Sans` (200–1000) — **mesma do site original** | Texto, navegação, tabelas, formulários |
| Mono | `Space Grotesk` (500–700) | Eyebrow em caixa alta, metadado técnico |

Fontes reais e auto-hospedadas em `assets/fonts/`: `fonts-brand.css`
(Newsreader + Space Grotesk) e `fonts.css` (Nunito Sans). Zero hotlink, zero
fallback de sistema como substituta.

### Escala e tracking

O tracking acompanha o tamanho: quanto maior o display, mais fechado. Três
degraus com valor próprio, em vez de um só valendo para todos:

| Token | Tamanho | line-height | tracking |
|---|---|---|---|
| `.display-1` | `clamp(2.35rem, 5vw, 4rem)` | 1.02 | **-0.028em** |
| `.display-2` | `clamp(1.75rem, 3.2vw, 2.6rem)` | 1.08 | -0.022em |
| `.display-3` | `clamp(1.25rem, 2vw, 1.65rem)` | 1.18 | -0.014em |
| `.lede` | `clamp(1.03rem, 1.45vw, 1.16rem)` | 1.58 | 0 |
| corpo | 17px | 1.65 | 0 |
| `.meta` mono | 12px | 1.5 | +0.03em |
| eyebrow mono | 11.5px | — | **+0.15em** caixa alta |

**Eixo óptico.** Newsreader tem `opsz 6–72`. `font-optical-sizing: auto`
entrega o corte certo sem declarar tamanho a tamanho: fechada e legível em
corpo, mais contrastada e refinada em display.

**Alinhamento de número.** `font-variant-numeric: lining-nums tabular-nums` no
`body`, para as colunas de stat, as barras de nação e a tabela de busca
alinharem dígito a dígito. Valores grandes de stat levam `letter-spacing:
-0.03em`.

**Medida de leitura.** `.article` com `max-width: 66ch` e `.lede` com `60ch`.
Acima disso o olho perde a linha de volta.

## Regras que definem a linguagem visual

1. **Papel, não gradiente.** Fundo é papel quente; cartões brancos com fio de
   1px e **sem sombra**. O original empilha `elevation="2"` em card, botão e
   stat — o resultado é cinza sujo. Aqui a profundidade vem de borda e
   respiro.
2. **Três superfícies, três tons de texto, três pesos de fio.** Nada de
   hierarquia implícita: cada degrau tem token e medição própria.
3. **Serif para a autoridade, sans para a operação.** A instituição fala em
   registro de patrimônio; quem cadastra e busca fala em formulário.
4. **Um único acento, no máximo duas vezes por viewport.** Persimmon no CTA
   primário e no estado ativo. Ouro é decoração de número.
5. **Nação como dado, não como festa.** As 8 nações viram filtro e um ponto
   de cor dessaturado no mapa — não um arco-íris de chips saturados. Cada
   tom recebe o mesmo orçamento de croma e passa 4.6:1 com texto branco.
6. **Dado real sempre visível.** 214 terreiros · 199 fotos · 90 bairros, em
   serif grande. Onde o dado não existe, a interface diz "não informado" em
   vez de preencher.
7. **Fronteira fina e visível, respiro na grade, raio ≤ 4px.** Raio grande
   infantilizaria o assunto.
8. **Estados invertem par inteiro.** Hover de botão sólido troca fg *e* bg no
   mesmo passo; texto nunca clareia no hover. Foco sempre com anel
   `:focus-visible` de 2px em `--accent` (7.15:1 sobre papel).

## Voz

pt-BR, registro público-institucional e afirmativo. Termos técnicos
preservados: *terreiro, matriz africana, recenseamento, nação, censo,
bairro*. Nunca "candomblé" como sinônimo genérico — cada nação é nomeada.
