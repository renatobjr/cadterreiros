# AGENT.md — web-react

Instruções para agentes que trabalham neste diretório. Ler inteiro antes de
tocar em qualquer arquivo. Vale para `web-react/` e para mudanças em `api/`
exigidas pelo front novo.

## 1. O que é isto

Reconstrução em **React 18 + TypeScript + Vite** do front do Cadterreiros
(mapeamento de terreiros de matriz africana da Região Metropolitana de João
Pessoa, Casa de Cultura Ilê Asé D'Osoguian). Substitui `web/` (Vue 3) no
cutover. O mantenedor do site e detentor dos direitos acompanha o projeto —
sem bloqueio de publicação.

**Duas fontes, dois papéis — não misturar:**

- **Visual:** `.artifacts/` (espelho do protótipo open-design) e
  `brand-spec.md` nele. É a verdade sobre cor, tipo, espaçamento e o *look*
  das telas. O JSX do protótipo serve de **inspiração de layout apenas** —
  nunca é copiado nem portado.
- **Comportamento:** `web/` atual (Vue) + API em `api/`. É a verdade sobre
  fluxos, validações, endpoints e permissões. Reimplementar em React
  idiomático, não traduzir linha a linha.

## 2. Premissas inegociáveis

### 2.1 React — boas práticas

1. **Function components + hooks**, sempre. Nada de classes.
2. **TypeScript strict**, sem `any` implícito. Tipos de domínio em
   `src/domain/` (ex.: `Community`, `Nation`, `CensusStep`) espelhando o
   payload real da API — nunca inventar campo.
3. **Regras dos hooks** levadas a sério: sem hook condicional, dependências
   de `useEffect` corretas. **Derivar com `useMemo`/cálculo direto em vez de
   sincronizar estado com `useEffect`** (fetch → estado → `useMemo` filtra;
   nunca `useEffect` copiando prop para state).
4. **Estado no nível mais baixo possível** (colocate). Sobe para Context
   só o que é global de verdade (sessão auth). Sem Redux/Zustand salvo
   necessidade provada.
5. **Composição sobre configuração**: `children`, render props e componentes
   pequenos. Props explícitas e tipadas; `key` estável (id real, nunca índice
   quando a lista muda).
6. **UI nunca fala com a rede.** Todo acesso à API passa por `src/api/`
   (cliente axios + módulos por recurso). Componente recebe dado e callback.
7. **Acessibilidade é requisito**: `label` em todo campo, erro ligado ao
   campo via `aria-describedby`, foco no primeiro erro, `aria-live` para
   contagens/estados, `alt` em toda imagem, contraste AA herdado dos tokens.
8. Sem `console.log` commitado; erro de API vira estado visível, nunca
   silêncio.

### 2.2 Arquitetura hierárquica — componentes atômicos por escopo

Estrutura obrigatória (criar sob `src/` conforme a necessidade, sem
antecipar camadas vazias):

```
src/
  components/
    ui/          átomos: Button, TextInput, Select, Card, Badge, Modal… (puros, sem domínio)
    composed/    moléculas: SearchField, Pagination, EmptyState, Stat… (só compõem ui/)
    layout/      Nav, Footer, PageShell… (estrutura, sem regra de negócio)
  features/
    <escopo>/    ex.: communities/, census/, auth/, metrics/
      components/  organismos do escopo (CommunityCard, CensusTable…)
      hooks.ts     lógica do escopo (useCommunities…)
      types.ts     tipos do escopo
  pages/         telas = composição de features + layout (Home, Buscar, Terreiro…)
  api/           client.ts + communities.ts, auth.ts, users.ts
  domain/        nations.ts, sanitize.ts (regras do saneamento), metrics.ts
  styles/        tokens.css (gerado) + base/components/pages
```

Regras de dependência (valem para imports):

1. `pages/` pode usar tudo abaixo; `features/<a>` **nunca importa** de
   `features/<b>` — compartilhado sobe para `composed/` ou `ui/`.
2. `ui/` é puro: nenhum import de `features/`, `pages/`, `api/` ou `domain/`
   com regra de negócio (constantes de estilo/tokens ok).
3. **Um componente por arquivo**, nome do arquivo = nome do componente.
4. Componente novo nasce no nível mais baixo que o escopo permite; só sobe
   de nível quando o **segundo** uso aparecer (não antecipar abstração).
5. Colocar estilo junto do nível: classe nova reutilizável vai no CSS da
   camada correspondente; CSS de página só para layout daquela página.

### 2.3 Sem frameworks — tudo do zero

1. **Proibido**: biblioteca de componentes (MUI, Chakra, AntD, shadcn),
   framework CSS (Tailwind/Bootstrap), CSS-in-JS com runtime, form libs,
   state libs — salvo necessidade provada e registrada.
2. **Permitido sem discussão**: `react`, `react-dom`, `react-router`,
   `axios` (ou `fetch` nativo), `leaflet` + `leaflet.markercluster` (mapa —
   decisão do projeto), `date-fns`/`dayjs` se preciso, tooling de teste e
   build (Vitest, Testing Library, Playwright).
3. Qualquer dependência nova fora da lista acima exige justificativa em uma
   linha no commit/PR — "preciso de X porque Y, e não dá para fazer à mão
   porque Z".
4. Estilo é **CSS puro + custom properties dos tokens**. Reutilizar as
   classes de `.artifacts/css/` quando cobrirem o caso; classe nova segue o
   padrão de nomenclatura existente (bloco `__` elemento, sem camelCase).

### 2.4 Identidade e dados (herdado do protótipo, continua valendo)

1. `scripts/tokens.mjs` (futura casa: `web-react/scripts/`) é a **fonte
   única**; `tokens.css` é gerado, nunca editado à mão. Cor só em `oklch()`,
   nunca hex no código.
2. Fio de 1px, **sem sombra**; raio ≤ 4px; grade de 8px; Newsreader p/
   display, Nunito Sans p/ corpo, Space Grotesk p/ meta.
3. **Nunca inventar dado.** Onde a API não informa, a interface diz
   **"não informado"** — nunca 0, nunca palpite. Saneamento centralizado em
   `domain/sanitize.ts` (yearFoundation `20`/`0`, `city: "Brazil"`,
   languages `"outros"`, `censusTaker` objeto|string).
4. `leaderContacts` (telefone/e-mail) **não existe** no front público —
   é dado pessoal. Não reintroduzir.
5. Tudo em **pt-BR** (inclusive `aria-label`). Vocabulário: terreiro, matriz
   africana, recenseamento, nação, censo, bairro. Identificadores técnicos e
   rotas em inglês onde o padrão exigir.

## 3. Rotas (URLs do protótipo, comportamento do Vue)

Públicas: `/`, `/buscar`, `/terreiro/:slug`, `/mapeamento`, `/sobre-o-projeto`,
`/sobre-a-cciao`, `/cadastro-voluntario`, `/entrar`, 3 FAQs de conteúdo,
`/design-system` (interna, fora do menu). Auth: `/esqueci-minha-senha`,
`/primeiro-acesso`, `/otp/:token/:email`, `/set-password/:token` (não
existem no protótipo — construir na identidade nova). Redirects legados:
`/busca`→`/buscar`, `/:id/:slug`→`/terreiro/:slug`, `/login`→`/entrar`.
`/admin` é fase 2.

## 4. Backend (quando o front exigir)

- API intocada salvo necessidade explícita. Exceção já aprovada: novo
  `POST /api/v1/religious-communities/public/create` (sem auth, cria com
  step pendente, retorna id como protocolo; rate-limit + validação strict).
- Endpoints reutilizados como estão: `public/list|random|mapping|:id`,
  `auth/*`, e na fase 2 os privados + `users/*`.

## 5. Gates e disciplina

1. Portar para este repo os gates de `.artifacts/scripts/`
   (`verify-contrast` 39 pares AA, `verify-tokens`, `verify-classes`,
   `verify-paths`) + suite Vitest/Testing Library cobrindo os fluxos reais
   contra a API. **Nenhuma entrega passa com gate vermelho.**
2. Uma tarefa por vez, escopo fechado. Rodar os gates antes de declarar pronto.
3. Reportar o que **não** foi verificado. Falso "funciona" é pior que
   "não testei".
4. Build local: Node 22 (`.nvmrc` na raiz), `npm ci`, `npm run build` limpo.
   `dist/` e `.env` nunca commitados.
