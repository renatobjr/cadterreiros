# Task: Migração do frontend Vue 3 para React 18 + TypeScript + Vite (web-react)

**Link:** N/A (task interna, sem Asana)
**Task GID:** N/A
**Projeto:** Cadterreiros — Mapeamento dos Terreiros de Matriz Africana
**Responsavel:** Equipe de desenvolvimento
**Prazo:** Sem prazo definido
**Status:** Em planejamento
**Tipo:** Melhoria / Migração de stack
**Prioridade:** Alta

---

## Descricao

Migração da aplicação web atual (Vue 3 + Vite, em `web/`) para uma reconstrução em React 18 + TypeScript + Vite (em `web-react/`). O objetivo é substituir o front-end Vue no cutover, mantendo a identidade visual nova (definida em `.artifacts/` e `brand-spec.md`) e o comportamento existente (fluxos, validações, endpoints, permissões).

Duas fontes, dois papeis (ver `web-react/AGENT.md`):
- **Visual:** `.artifacts/` (espelho do protótipo open-design) + `brand-spec.md`. Verdade sobre cor, tipo, espaçamento e look das telas.
- **Comportamento:** `web/` atual (Vue) + API em `api/`. Verdade sobre fluxos, validações, endpoints e permissões.

Regras inegociáveis (AGENT.md §2):
1. React function components + hooks, TypeScript strict, sem `any` implícito.
2. Sem frameworks de UI/CSS (sem MUI, Chakra, Tailwind, etc.) — CSS puro + tokens.
3. Identidade herdada do protótipo: fio de 1px, sem sombra, raio ≤ 4px, grade 8px, Newsreader/Nunito Sans/Space Grotesk.
4. Nunca inventar dado — "não informado" quando a API não informa.
5. `leaderContacts` (telefone/e-mail) não existe no front público.
6. Tudo em pt-BR. Vocabulário: terreiro, matriz africana, recenseamento, nação, censo, bairro.
7. Rotas conforme §3 do AGENT.md (públicas + auth + redirects legados). `/admin` é fase 2.

---

## Subtasks

| # | Titulo | Status | Assignee |
|---|--------|--------|----------|
| 1 | Scaffold `web-react/` (Vite + React 18 + TS + ESLint + Vitest) | Pendente | — |
| 2 | Copiar/espelhar `.artifacts/` → `web-react/` (tokens, CSS, fonts, brand-spec, scripts) | Pendente | — |
| 3 | Portar pipeline de tokens (`build-tokens.mjs`) e gates (`verify-contrast`, `verify-tokens`, `verify-classes`, `verify-paths`) | Pendente | — |
| 4 | Implementar camada `src/domain/` (tipos, sanitize, metrics) espelhando payload da API | Pendente | — |
| 5 | Implementar `src/api/` (client axios + módulos por recurso) | Pendente | — |
| 6 | Implementar `src/components/ui/` (átomos) e `composed/` (moléculas) | Pendente | — |
| 7 | Implementar `src/features/` (communities, census, auth, metrics) | Pendente | — |
| 8 | Implementar `src/pages/` (telas públicas) | Pendente | — |
| 9 | Implementar rotas e redirects legados | Pendente | — |
| 10 | Testes (Vitest + Testing Library) para fluxos reais contra a API | Pendente | — |
| 11 | Build local limpo (`npm ci`, `npm run build`) + gates verdes | Pendente | — |

---

## Comentarios Relevantes

- `web-react/AGENT.md`: "Reconstrução em React 18 + TypeScript + Vite do front do Cadterreiros. Substitui `web/` (Vue 3) no cutover."
- `web-react/AGENT.md §2.3`: "Proibido: biblioteca de componentes (MUI, Chakra, AntD, shadcn), framework CSS (Tailwind/Bootstrap), CSS-in-JS com runtime, form libs, state libs — salvo necessidade provada."
- `web-react/AGENT.md §2.4`: "`scripts/tokens.mjs` é a fonte única; `tokens.css` é gerado, nunca editado à mão. Cor só em `oklch()`, nunca hex no código."
- `.artifacts/README.md`: "Espelho somente-leitura dos insumos visuais do projeto open-design. É a referência visual do `web-react/`."
- Mock do open-design (`bd938936`): protótipo de alta fidelidade com telas públicas + área da curadoria, 199 fotos, 214 terreiros.

---

## Custom Fields

| Campo | Valor |
|-------|-------|
| Tipo | Melhoria / Migração de stack |
| Prioridade | Alta |
| Squad | Frontend |

---

## Parent Task (se houver)

N/A — task raiz da migração.

---

## Termos Extraidos

### Caminhos de Arquivo Explicitos

- [ ] `web/` (Vue 3 atual — fonte de comportamento)
- [ ] `web-react/` (destino — atualmente vazio, só `AGENT.md`)
- [ ] `.artifacts/` (referência visual — espelho do open-design)
- [ ] `.artifacts/brand-spec.md` (identidade)
- [ ] `.artifacts/tokens.mjs` (fonte de tokens)
- [ ] `.artifacts/css/` (base, components, pages, design-system, tokens)
- [ ] `.artifacts/fonts/` (19 woff2 + 2 CSS)
- [ ] `.artifacts/data/` (communities.json 214, stats.json)
- [ ] `.artifacts/scripts/` (13 scripts/gates)
- [ ] `api/` (backend — não modificar salvo necessidade)
- [ ] `web/src/router/base.js`, `web/src/router/auth.js`, `web/src/router/index.js`
- [ ] `web/src/stores/` (5 stores)
- [ ] `web/src/services/` (3 services)
- [ ] `web/src/pages/` (16 páginas Vue)
- [ ] `web/src/components/` (27 componentes Vue)
- [ ] `web/src/layouts/` (Base, Dashboard, Default)
- [ ] `web/src/plugins/` (index, vuetify)
- [ ] `web/src/configs/` (api, axios)
- [ ] `web/src/enum/` (ECensusStep, ECommunityTypes, ELanguages, ENations)
- [ ] `web/src/utils/` (geocoding, normalizer, setChipColor, validator)
- [ ] `web/vite.config.mjs`
- [ ] `web/package.json`
- [ ] `open-design/.od/projects/bd938936-5433-43c2-9570-5924b83751c8/` (mock de alta fidelidade)

### Nomes de Componentes/Funcoes/Hooks

- `App.vue` (raiz)
- `CadNav`, `CadFooter`, `CadHero`, `CadShowcase`, `CadMapNumbers`, `CadGoogleMaps`, `CadGridFAQ`
- `CadCommunity`, `CadChip`, `CadEmphasis`, `CadShare`
- `CadDataTableCommunitiesApproved/Pending/Rejected`, `CadTableCommunity`
- Dialogs: `CadSetOwnerDialog`, `CadSetCensusStepDialog`, `CadRequestCorrectionsDialog`, `CadApproveDialog`, `CadRejectDialog`, `CadSetUserStatusDialog`, `CadChangeUserRoleDialog`, `CadAddUserDialog`
- Stores: `auth.store`, `religiousCommunities.store`, `users.store`, `snackbar.store`
- Services: `auth`, `religiousCommunities`, `users`
- Router: `base`, `auth`, `index`
- Layouts: `Base`, `Dashboard`, `Default`
- Pages: `Index`, `Search`, `Community`, `CommunityRegister`, `AboutProject`, `Login`, `OTP`, `SetEmailForm`, `SetPassword`, `gridFAQ/*`, `dashboard/*`

### Modulos/Features Referenciados

- `communities` (listagem, busca, detalhe, cadastro)
- `census` (recenseamento, steps)
- `auth` (login, OTP, recuperação de senha, primeiro acesso)
- `metrics` (mapeamento, gráficos por nação/bairro/década)
- `users` (gestão de usuários, roles, status)
- `admin` (curadoria: fila de revisão, aprovação, edição, descarte)

### Criterios de Aceitacao Brutos

- [ ] `web-react/` scaffold com Vite + React 18 + TypeScript + ESLint + Vitest
- [ ] Tokens CSS gerados a partir de `tokens.mjs` (paridade verificada por gate)
- [ ] CSS de referência portado (base, components, pages, design-system)
- [ ] Fontes auto-hospedadas (19 woff2 + 2 CSS)
- [ ] Tipos de domínio em `src/domain/` espelhando payload da API (sem inventar campos)
- [ ] `src/api/` com client axios + módulos por recurso (sem rede na UI)
- [ ] Componentes atômicos em `src/components/ui/` e `composed/`
- [ ] Features em `src/features/<escopo>/`
- [ ] Telas em `src/pages/`
- [ ] Rotas públicas + auth + redirects legados (conforme AGENT.md §3)
- [ ] `/admin` é fase 2
- [ ] Testes (Vitest + Testing Library) para fluxos reais contra a API
- [ ] Build local limpo (`npm ci`, `npm run build`)
- [ ] Gates verdes (verify-contrast 39 pares AA, verify-tokens, verify-classes, verify-paths)
- [ ] Sem `console.log` commitado; erro de API vira estado visível
- [ ] Acessibilidade: label em todo campo, erro ligado via `aria-describedby`, foco no primeiro erro, `aria-live`, `alt` em toda imagem, contraste AA
- [ ] Tudo em pt-BR
- [ ] `leaderContacts` (telefone/e-mail) não existe no front público

---

## Observacoes

- Sem task no Asana — task interna de migração.
- `FETCH_ASANA` indisponível; ASANA.md gerado a partir do contexto do projeto (AGENT.md, .artifacts/README.md, brand-spec.md, estrutura do codebase).
- Escopo estimado: ~103 arquivos em `web/src/` (27 componentes, 16 páginas, 5 stores, 3 services, 4 layouts, 4 enums, 4 utils).
- Área logada (`/admin`) é fase 2 conforme AGENT.md.
- Telas de auth (`/entrar`, `/otp`, `/set-password`, `/primeiro-acesso`, `/esqueci-minha-senha`) não existem no protótipo — construir na identidade nova.
- Mock do open-design cobre telas públicas + admin (curadoria), com 199 fotos e 214 terreiros.
- `web-react/` atualmente vazio (só `AGENT.md`).
- Imagens do mock não batem com uploads atuais (0 de 199 UUIDs encontrados) — revalidar contra API real.
EOF
echo "=== ASANA.md criado ==="; wc -l /media/files/antimonitor/projects/cadterreiros/.code-spec-driven/ASANA.md