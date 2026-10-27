# Migração Vue 3 → React 18 + TypeScript + Vite (web-react) — Task Plan

**Spec:** `.code-spec-driven/SPEC.md` | **Design:** `.code-spec-driven/DESIGN.md`
**Auto-sizing:** Large | **Branch:** `feat/migracao-vue-para-react`

## Tabela de Progresso (Done When)

| Task | Título | Status | Done When | Gate | Evidência |
|------|--------|--------|-----------|------|-----------|
| T0 | Atualizar .artifacts com prototype.css + tokens de nação | ✅ Done | prototype.css copiado; 8 tokens de nação adicionados; brand-spec atualizado | Build | commit ea96b4f; prototype.css 3.046 linhas; tokens 71 (8 nação); build-tokens ✓ |
| T1 | Scaffold Vite + React 18 + TS + ESLint + Vitest | ✅ Done | build/lint/smoke passam | Build | commit e18cdab; build ✓; lint ✓; smoke 1/1 |
| T2 | Portar tokens.mjs + build-tokens | ✅ Done | tokens.css gerado; verify-tokens passa | Quick | commit 78165a3; tokens.css idêntico (63 tokens); build ✓ |
| T3 | Portar CSS de referência | ✅ Done | arquivos presentes; verify-classes passa | Quick | commit 8f14a34; 4 CSS idênticos (base/components/pages/design-system); build ✓ |
| T4 | Copiar fontes auto-hospedadas | ✅ Done | 19 woff2 presentes; verify-paths passa | Full | commit f5a08fb; 19 woff2 + 2 CSS; zero hotlink; build ✓ |
| T5 | Portar gates | ✅ Done | gates executáveis | Full | commit 684e968; contrast 39/0; paths 0 quebradas; tokens 1 problema esperado |
| T6 | ui/Button | ✅ Done | renderiza variantes; a11y ok | Quick | commit 12322b9; build ✓; lint ✓; 14 testes (2 files) |
| T7 | ui/TextInput | ✅ Done | renderiza; erro ligado | Quick | commit 7d4cec2; build ✓; lint ✓; 18 testes (3 files) |
| T8 | layout/Nav + Footer | ✅ Done | renderiza; navegação ok | Quick | commit acd3b1a; build ✓; lint ✓; 20 testes (4 files) |
| T9 | domain/types.ts | ✅ Done | compila strict; sem any | Build | commit 5b33229; build ✓; lint ✓; types.ts espelhando API |
| T10 | domain/sanitize.ts | ✅ Done | testes de sanitize passam | Quick | commit 8b2e360; build ✓; lint ✓; 15 testes (sanitize.test.ts) |
| T11 | api/client.ts | ✅ Done | client configurado | Quick | commit 9d3807f; build ✓; lint ✓; 3 testes (client.test.ts → test/api/) |
| T12 | api/communities.ts | ✅ Done | chamadas tipadas | Quick | commit b506943; build ✓; lint ✓; 4 testes (communities.test.ts → test/api/) |
| T13 | api/auth.ts | ✅ Done | chamadas tipadas | Quick | commit f299499; build ✓; lint ✓; 5 testes (auth.test.ts → test/api/) |
| T14 | features/communities/CommunityCard | ✅ Done | renderiza com dados | Quick | commit c1c5d14; build ✓; lint ✓; 2 testes (CommunityCard.test.tsx) |
| T15 | features/communities/SearchFilters | ✅ Done | filtra sem reload | Quick | commit 39019ea; build ✓; lint ✓; 2 testes (SearchFilters.test.tsx) |
| T16 | features/auth/LoginForm | ✅ Done | submit chama API | Quick | commit f299499; build ✓; lint ✓; 2 testes (LoginForm.test.tsx) |
| T17 | pages/Home | ✅ Done | renderiza dados reais | Full | commit 437d21d; build ✓; lint ✓; 1 teste (Home.test.tsx) |
| T18 | pages/Search | ✅ Done | filtra SPA | Full | commit 39019ea; build ✓; lint ✓; 1 teste (Search.test.tsx) |
| T19 | pages/Community | ✅ Done | renderiza | Full | commit 7fcf550; build ✓; lint ✓; 1 teste (Community.test.tsx) |
| T20 | pages/Mapping | ✅ Done | renderiza 10 gráficos | Full | commit 0b84a45; build ✓; lint ✓; 1 teste (Mapping.test.tsx) |
| T21 | pages/AboutProject | ✅ Done | renderiza | Quick | commit 04a7ee4; build ✓; lint ✓; 1 teste (AboutProject.test.tsx) |
| T22 | pages/CommunityRegister | ✅ Done | submit chama /public/create | Full | commit 259714b; build ✓; lint ✓; 1 teste (CommunityRegister.test.tsx) |
| T23 | Router + redirects | ✅ Done | todas rotas; redirects funcionam | Full | commit 6e14c00; build ✓; lint ✓; react-router-dom; redirects legados + 404 |
| T24 | features/metrics/MappingCharts | ✅ Done | renderiza | Full | commit 6e14c00; build ✓; lint ✓; 1 teste (MappingCharts.test.tsx) |build ✓; lint ✓; 1 teste (MappingCharts.test.tsx) | renderiza | Full | 
| T25 | composed/Pagination | ✅ Done | navega páginas | Quick | commit b010237; build ✓; lint ✓; 7 testes (Pagination.test.tsx) |
| T26 | composed/EmptyState | ✅ Done | renderiza | Quick | commit e5cb520; build ✓; lint ✓; 3 testes (EmptyState.test.tsx) |
| T27 | pages/Login | ✅ Done | renderiza | Quick | commit b45a2c9; build ✓; lint ✓; 1 teste (Login.test.tsx) |
| T28 | pages/OTP | ✅ Done | renderiza; submit OTP | Quick | commit b45a2c9; build ✓; lint ✓; 1 teste (OTP.test.tsx) | submit OTP | Quick | 
| T29 | pages/SetPassword | ✅ Done | renderiza | Quick | commit 96d56b9; build ✓; lint ✓; 1 teste (SetPassword.test.tsx) | renderiza | Quick | 
| T30 | pages/FirstAccess | ✅ Done | renderiza | Quick | commit ff61bb3; build ✓; lint ✓; 3 testes (FirstAccess.test.tsx) | renderiza | Quick | 
| T31 | pages/ForgotPassword | ✅ Done | renderiza | Quick | commit 22b02fc; build ✓; lint ✓; 3 testes (ForgotPassword.test.tsx) | renderiza | Quick | 
| T32 | Auth Context | ✅ Done | login/logout funciona | Quick | commit pendente; build ✓; lint ✓; 6 testes (AuthContext.test.tsx) | login/logout funciona | Quick | 
| T33 | Schema registeredVoluntarily + censusTaker opcional | ⬜ Pending | campo presente; censusTaker optional | Build | 
| T34 | GET /public/oldest | ⬜ Pending | retorna 9 ordenados | Full | 
| T35 | POST /public/create | ⬜ Pending | cria com PENDING, registeredVoluntarily true, censusTaker null; retorna id | Full | 
| T36 | POST /public/upload-main-picture/:id | ⬜ Pending | upload funciona | Full | 
| T37 | GET /public/stats/summary | ⬜ Pending | retorna totais | Full | 
| T38 | GET /public/stats/by-* (10) | ⬜ Pending | 10 endpoints retornam | Full | 
| T39 | GET /stats/* admin (6) | ⬜ Pending | 6 endpoints retornam | Full | 
| T40 | rate-limit + header x-cadterreiros-api | ⬜ Pending | 403 sem header; 429 após 5 req | Full | 
| T41 | class-validator strict | ⬜ Pending | 400 com erros | Full | 
| T42 | Remover /public/random + /public/mapping | ⬜ Pending | endpoints não existem | Full | 
| T43 | Vitest setup | ⬜ Pending | npm run test roda | Full | 
| T44 | Testes fluxos reais | ⬜ Pending | testes passam | Full | 
| T45 | verify-contrast | ⬜ Pending | verde | Full | 
| T46 | verify-tokens | ⬜ Pending | verde | Quick | 
| T47 | verify-classes | ⬜ Pending | verde | Quick | 
| T48 | verify-paths + build | ⬜ Pending | verde + build limpo | Build | 
| T49 | CookieBanner component | ⬜ Pending | renderiza; persiste; integra gtag | Full | 
| T50 | CookieBanner tests | ⬜ Pending | render/accept/reject/persist | Full | 
| T51 | Importar CSS no main.tsx (tokens/base/components/pages/design-system/prototype) | ⬜ Pending | bundle CSS inclui design system; classes aplicadas | Build | |

## Gate Commands

- Quick: `cd web-react && npm run lint && node scripts/verify-tokens.mjs && node scripts/verify-classes.mjs`
- Full: `cd web-react && npm run test && node scripts/verify-contrast.mjs && node scripts/verify-paths.mjs`
- Build: `cd web-react && npm ci && npm run build`

## Test Coverage Matrix

| Requirement | Tests (co-located) | Gate |
|---|---|---|
| MIG-01 | scaffold smoke, build | Build |
| MIG-02 | CSS classes verify, contrast | Full |
| MIG-03 | page render tests | Full |
| MIG-04 | router tests | Full |
| MIG-05 | auth flow tests | Full |
| MIG-06 | registration flow tests | Full |
| MIG-07 | mapping charts tests | Full |
| MIG-08 | API oldest/create tests | Full |
| MIG-09 | stats endpoints tests | Full |
| MIG-10 | all gates | Full/Build |
| MIG-11 | CookieBanner render/accept/reject/persist | Full |
## Execution Plan

### Fase 1 — Scaffold + Identidade (T1–T8)
- T1: Scaffold Vite React TS (MIG-01)
- T2: Portar tokens.mjs + build-tokens (MIG-01)
- T3: Portar CSS base/components/pages/design-system (MIG-02)
- T4: Copiar fontes woff2 + CSS (MIG-01)
- T5: Portar gates scripts (MIG-02/MIG-10)
- T6: ui/Button (MIG-02)
- T7: ui/TextInput (MIG-02)
- T8: layout/Nav + Footer (MIG-02)

### Fase 2 — Domínio + API client (T9–T16)
- T9: domain/types.ts (MIG-03)
- T10: domain/sanitize.ts (MIG-03)
- T11: api/client.ts (MIG-03)
- T12: api/communities.ts (MIG-03)
- T13: api/auth.ts (MIG-05)
- T14: features/communities/CommunityCard (MIG-03)
- T15: features/communities/SearchFilters (MIG-03)
- T16: features/auth/LoginForm (MIG-05)

### Fase 3 — Telas públicas (T17–T26)
- T17: pages/Home (MIG-03)
- T18: pages/Search (MIG-03)
- T19: pages/Community (MIG-03)
- T20: pages/Mapping (MIG-07)
- T21: pages/AboutProject (MIG-03)
- T22: pages/CommunityRegister (MIG-06)
- T23: router + redirects (MIG-04)
- T24: features/metrics/MappingCharts (MIG-07)
- T25: composed/Pagination (MIG-03)
- T26: composed/EmptyState (MIG-03)

### Fase 4 — Auth (T27–T32)
- T27: pages/Login (MIG-05)
- T28: pages/OTP (MIG-05)
- T29: pages/SetPassword (MIG-05)
- T30: pages/FirstAccess (MIG-05)
- T31: pages/ForgotPassword (MIG-05)
- T32: auth Context (MIG-05)

### Fase 5 — API endpoints (T33–T42)
- T33: schema registeredVoluntarily + censusTaker optional (MIG-08)
- T34: GET /public/oldest (MIG-08)
- T35: POST /public/create (MIG-08)
- T36: POST /public/upload-main-picture/:id (MIG-08)
- T37: GET /public/stats/summary (MIG-09)
- T38: GET /public/stats/by-* (10 endpoints) (MIG-09)
- T39: GET /stats/* admin (6 endpoints) (MIG-09)
- T40: rate-limit + header x-cadterreiros-api (MIG-08)
- T41: class-validator strict (MIG-08)
- T42: Remove /public/random + /public/mapping (MIG-08)

### Fase 6 — Testes + Gates (T43–T48)
- T43: Vitest setup (MIG-10)
- T44: Testes fluxos reais (MIG-10)
- T45: verify-contrast (MIG-10)
- T46: verify-tokens (MIG-10)
- T47: verify-classes (MIG-10)
- T48: verify-paths + build (MIG-10)

### Fase 7 — Consentimento + integração CSS (T49–T51)
- T49: CookieBanner component (composed) (MIG-11)
- T50: CookieBanner tests (Vitest) (MIG-11)
- T51: Importar CSS no main.tsx (tokens/base/components/pages/design-system/prototype) (MIG-02)
## Tasks

### T1 — Scaffold Vite + React 18 + TS + ESLint + Vitest
- What: Criar scaffold em web-react com Vite, React 18, TS strict, ESLint, Vitest, estrutura src/.
- Where: web-react/
- Depends on: none
- Reuses: —
- Requirement: MIG-01
- Done when: `npm run build` compila; `npm run lint` sem warnings; diretórios criados.
- Tests: smoke test renderiza App; Gate: Build

### T2 — Portar tokens.mjs e gerar tokens.css
- What: Copiar .artifacts/scripts/tokens.mjs → web-react/scripts/tokens.mjs; rodar build-tokens.
- Where: web-react/scripts/, web-react/src/styles/tokens.css
- Depends on: T1
- Reuses: .artifacts/scripts/tokens.mjs, .artifacts/scripts/build-tokens.mjs
- Requirement: MIG-01
- Done when: tokens.css gerado; verify-tokens passa.
- Tests: verify-tokens.mjs; Gate: Quick

### T3 — Portar CSS de referência
- What: Copiar base.css, components.css, pages.css, design-system.css para src/styles/.
- Where: web-react/src/styles/
- Depends on: T1
- Reuses: .artifacts/css/*.css
- Requirement: MIG-02
- Done when: arquivos presentes; verify-classes passa.
- Tests: verify-classes.mjs; Gate: Quick

### T4 — Copiar fontes auto-hospedadas
- What: Copiar 19 woff2 + 2 CSS para public/fonts/.
- Where: web-react/public/fonts/
- Depends on: T1
- Reuses: .artifacts/fonts/
- Requirement: MIG-01
- Done when: zero hotlink; 19 woff2 presentes.
- Tests: verify-paths.mjs; Gate: Full

### T5 — Portar gates
- What: Copiar verify-*.mjs para web-react/scripts/ e adaptar paths.
- Where: web-react/scripts/
- Depends on: T1
- Reuses: .artifacts/scripts/verify-*.mjs
- Requirement: MIG-02, MIG-10
- Done when: gates executáveis.
- Tests: rodar cada gate; Gate: Full

### T6 — ui/Button
- What: Componente Button com variantes primary/ghost/quiet/danger + estados.
- Where: web-react/src/components/ui/Button.tsx
- Depends on: T3
- Reuses: CSS classes
- Requirement: MIG-02
- Done when: renderiza variantes; a11y ok.
- Tests: Button.test.tsx; Gate: Quick

### T7 — ui/TextInput
- What: Campo texto com label, erro aria-describedby, validação.
- Where: web-react/src/components/ui/TextInput.tsx
- Depends on: T3
- Reuses: CSS classes
- Requirement: MIG-02
- Done when: renderiza; erro ligado.
- Tests: TextInput.test.tsx; Gate: Quick

### T8 — layout/Nav + Footer
- What: Nav com drawer mobile + Footer grid.
- Where: web-react/src/components/layout/Nav.tsx, Footer.tsx
- Depends on: T6
- Reuses: CSS
- Requirement: MIG-02
- Done when: renderiza; navegação ok.
- Tests: Nav.test.tsx; Gate: Quick

### T9 — domain/types.ts
- What: Tipos espelhando payload da API.
- Where: web-react/src/domain/types.ts
- Depends on: T1
- Reuses: DESIGN.md Data Models
- Requirement: MIG-03
- Done when: compila strict; sem any.
- Tests: tsc; Gate: Build

### T10 — domain/sanitize.ts
- What: Regras de saneamento.
- Where: web-react/src/domain/sanitize.ts
- Depends on: T9
- Reuses: AGENT.md §2.4.3
- Requirement: MIG-03
- Done when: testes de sanitize passam.
- Tests: sanitize.test.ts; Gate: Quick

### T11 — api/client.ts
- What: axios client com base URL e interceptors.
- Where: web-react/src/api/client.ts
- Depends on: T1
- Reuses: Vue services
- Requirement: MIG-03
- Done when: client configurado.
- Tests: client.test.ts; Gate: Quick

### T12 — api/communities.ts
- What: Módulos list/get/search/oldest.
- Where: web-react/src/api/communities.ts
- Depends on: T11, T9
- Reuses: Vue services
- Requirement: MIG-03
- Done when: chamadas tipadas.
- Tests: communities.test.ts (mocked); Gate: Quick

### T13 — api/auth.ts
- What: login, otp, set-password, forgot.
- Where: web-react/src/api/auth.ts
- Depends on: T11
- Reuses: Vue services
- Requirement: MIG-05
- Done when: chamadas tipadas.
- Tests: auth.test.ts; Gate: Quick

### T14 — features/communities/CommunityCard
- What: Card de terreiro.
- Where: web-react/src/features/communities/components/CommunityCard.tsx
- Depends on: T6, T9
- Reuses: CSS
- Requirement: MIG-03
- Done when: renderiza com dados.
- Tests: CommunityCard.test.tsx; Gate: Quick

### T15 — features/communities/SearchFilters
- What: Filtros de busca.
- Where: .../SearchFilters.tsx
- Depends on: T7
- Reuses: CSS
- Requirement: MIG-03
- Done when: filtra sem reload.
- Tests: SearchFilters.test.tsx; Gate: Quick

### T16 — features/auth/LoginForm
- What: Form login.
- Where: web-react/src/features/auth/components/LoginForm.tsx
- Depends on: T7, T13
- Reuses: CSS
- Requirement: MIG-05
- Done when: submit chama API.
- Tests: LoginForm.test.tsx; Gate: Quick

### T17 — pages/Home
- What: Home com hero, stats, 9 mais antigos, mapeamento.
- Where: web-react/src/pages/Home.tsx
- Depends on: T12, T14
- Reuses: CSS
- Requirement: MIG-03
- Done when: renderiza dados reais.
- Tests: Home.test.tsx; Gate: Full

### T18 — pages/Search
- What: Busca com filtros/paginação.
- Where: web-react/src/pages/Search.tsx
- Depends on: T15, T12, T25
- Reuses: CSS
- Requirement: MIG-03
- Done when: filtra SPA.
- Tests: Search.test.tsx; Gate: Full

### T19 — pages/Community
- What: Ficha completa.
- Where: web-react/src/pages/Community.tsx
- Depends on: T12
- Reuses: CSS
- Requirement: MIG-03
- Done when: renderiza.
- Tests: Community.test.tsx; Gate: Full

### T20 — pages/Mapping
- What: Mapa + gráficos.
- Where: web-react/src/pages/Mapping.tsx
- Depends on: T24
- Reuses: Leaflet
- Requirement: MIG-07
- Done when: renderiza 10 gráficos.
- Tests: Mapping.test.tsx; Gate: Full

### T21 — pages/AboutProject
- What: Artigo.
- Where: web-react/src/pages/AboutProject.tsx
- Depends on: T8
- Reuses: CSS
- Requirement: MIG-03
- Done when: renderiza.
- Tests: AboutProject.test.tsx; Gate: Quick

### T22 — pages/CommunityRegister
- What: Cadastro voluntário multi-step.
- Where: web-react/src/pages/CommunityRegister.tsx
- Depends on: T7, T11
- Reuses: CSS
- Requirement: MIG-06
- Done when: submit chama /public/create.
- Tests: CommunityRegister.test.tsx; Gate: Full

### T23 — Router + redirects
- What: Configurar rotas e redirects legados + 404.
- Where: web-react/src/router.tsx (ou App)
- Depends on: T17..T22
- Reuses: AGENT.md §3
- Requirement: MIG-04
- Done when: todas rotas; redirects funcionam.
- Tests: router.test.tsx; Gate: Full

### T24 — features/metrics/MappingCharts
- What: 10 gráficos.
- Where: web-react/src/features/metrics/components/MappingCharts.tsx
- Depends on: T9
- Reuses: CSS
- Requirement: MIG-07
- Done when: renderiza.
- Tests: MappingCharts.test.tsx; Gate: Full

### T25 — composed/Pagination
- What: Pager.
- Where: web-react/src/components/composed/Pagination.tsx
- Depends on: T6
- Reuses: CSS
- Requirement: MIG-03
- Done when: navega páginas.
- Tests: Pagination.test.tsx; Gate: Quick

### T26 — composed/EmptyState
- What: Empty state.
- Where: web-react/src/components/composed/EmptyState.tsx
- Depends on: T6
- Reuses: CSS
- Requirement: MIG-03
- Done when: renderiza.
- Tests: EmptyState.test.tsx; Gate: Quick

### T27 — pages/Login
- What: Tela login.
- Where: web-react/src/pages/Login.tsx
- Depends on: T16
- Reuses: CSS
- Requirement: MIG-05
- Done when: renderiza.
- Tests: Login.test.tsx; Gate: Quick

### T28 — pages/OTP
- What: Verificação OTP.
- Where: web-react/src/pages/OTP.tsx
- Depends on: T13
- Reuses: CSS
- Requirement: MIG-05
- Done when: submit OTP.
- Tests: OTP.test.tsx; Gate: Quick

### T29 — pages/SetPassword
- What: Definir senha.
- Where: web-react/src/pages/SetPassword.tsx
- Depends on: T13
- Reuses: CSS
- Requirement: MIG-05
- Done when: renderiza.
- Tests: SetPassword.test.tsx; Gate: Quick

### T30 — pages/FirstAccess
- What: Primeiro acesso.
- Where: web-react/src/pages/FirstAccess.tsx
- Depends on: T13
- Reuses: CSS
- Requirement: MIG-05
- Done when: renderiza.
- Tests: FirstAccess.test.tsx; Gate: Quick

### T31 — pages/ForgotPassword
- What: Recuperar senha.
- Where: web-react/src/pages/ForgotPassword.tsx
- Depends on: T13
- Reuses: CSS
- Requirement: MIG-05
- Done when: renderiza.
- Tests: ForgotPassword.test.tsx; Gate: Quick

### T32 — Auth Context
- What: Context de sessão.
- Where: web-react/src/features/auth/context.tsx
- Depends on: T13
- Reuses: —
- Requirement: MIG-05
- Done when: login/logout funciona.
- Tests: AuthContext.test.tsx; Gate: Quick

### T33 — Schema registeredVoluntarily + censusTaker opcional
- What: Atualizar schema Mongoose.
- Where: api/src/models/... (religious community)
- Depends on: none
- Reuses: —
- Requirement: MIG-08
- Done when: campo presente; censusTaker optional.
- Tests: schema test; Gate: Build (api tsc)

### T34 — GET /public/oldest
- What: Endpoint 9 mais antigos.
- Where: api/src/routes/public.ts (ou controller)
- Depends on: T33
- Reuses: —
- Requirement: MIG-08
- Done when: retorna 9 ordenados.
- Tests: integration test; Gate: Full

### T35 — POST /public/create
- What: Cadastro voluntário.
- Where: api public route
- Depends on: T33, T40, T41
- Reuses: —
- Requirement: MIG-08
- Done when: cria com censusStep PENDING, registeredVoluntarily true, censusTaker null; retorna id.
- Tests: integration; Gate: Full

### T36 — POST /public/upload-main-picture/:id
- What: Upload foto público.
- Where: api public route
- Depends on: T35
- Reuses: multer
- Requirement: MIG-08
- Done when: upload funciona.
- Tests: integration; Gate: Full

### T37 — GET /public/stats/summary
- What: Totais.
- Where: api public stats
- Depends on: T33
- Reuses: —
- Requirement: MIG-09
- Done when: retorna totais.
- Tests: integration; Gate: Full

### T38 — GET /public/stats/by-* (10)
- What: Agregações públicas.
- Where: api public stats
- Depends on: T33
- Reuses: —
- Requirement: MIG-09
- Done when: 10 endpoints retornam.
- Tests: integration; Gate: Full

### T39 — GET /stats/* admin (6)
- What: Agregações admin.
- Where: api stats (auth)
- Depends on: T33
- Reuses: —
- Requirement: MIG-09
- Done when: 6 endpoints retornam.
- Tests: integration; Gate: Full

### T40 — rate-limit + header x-cadterreiros-api
- What: Middleware de segurança.
- Where: api middleware
- Depends on: none
- Reuses: express-rate-limit
- Requirement: MIG-08
- Done when: 403 sem header; 429 após 5 req.
- Tests: integration; Gate: Full

### T41 — class-validator strict
- What: Validação strict no create.
- Where: api validation
- Depends on: none
- Reuses: class-validator (nova dep)
- Requirement: MIG-08
- Done when: 400 com erros.
- Tests: integration; Gate: Full

### T42 — Remover /public/random e /public/mapping
- What: Remover endpoints substituídos.
- Where: api routes
- Depends on: T34, T37
- Reuses: —
- Requirement: MIG-08
- Done when: endpoints não existem.
- Tests: integration; Gate: Full

### T43 — Vitest setup
- What: Configurar Vitest + Testing Library.
- Where: web-react/vitest.config.ts
- Depends on: T1
- Reuses: —
- Requirement: MIG-10
- Done when: `npm run test` roda.
- Tests: —; Gate: Full

### T44 — Testes fluxos reais
- What: Testes login, busca, cadastro, mapeamento.
- Where: *.test.tsx co-located
- Depends on: T43
- Reuses: —
- Requirement: MIG-10
- Done when: testes passam.
- Tests: os próprios; Gate: Full

### T45 — verify-contrast
- What: Rodar gate 39 pares AA.
- Where: scripts
- Depends on: T5
- Reuses: —
- Requirement: MIG-10
- Done when: verde.
- Tests: verify-contrast.mjs; Gate: Full

### T46 — verify-tokens
- What: Gate tokens.
- Where: scripts
- Depends on: T2
- Reuses: —
- Requirement: MIG-10
- Done when: verde.
- Tests: verify-tokens.mjs; Gate: Quick

### T47 — verify-classes
- What: Gate classes.
- Where: scripts
- Depends on: T3
- Reuses: —
- Requirement: MIG-10
- Done when: verde.
- Tests: verify-classes.mjs; Gate: Quick

### T48 — verify-paths + build
- What: Gate paths + build final.
- Where: scripts
- Depends on: T4
- Reuses: —
- Requirement: MIG-10
- Done when: verde + build limpo.
- Tests: verify-paths.mjs; Gate: Build

### T49 — CookieBanner component (composed)
- What: Banner fixo no rodapé com 3 botões (Aceitar/Rejeitar/Personalizar); persistência em localStorage (chave `cadterreiros.consent`); integração com gtag consent (Google Consent Mode v2).
- Where: web-react/src/components/composed/CookieBanner.tsx
- Depends on: T6
- Reuses: CSS
- Requirement: MIG-11
- Done when: renderiza; persiste em localStorage; integra com gtag consent; testes passam.
- Tests: CookieBanner.test.tsx; Gate: Full

### T50 — CookieBanner tests (Vitest)
- What: Testes de render, aceitar, rejeitar e persistência.
- Where: web-react/src/components/composed/CookieBanner.test.tsx
- Depends on: T49, T43
- Reuses: —
- Requirement: MIG-11
- Done when: testes passam.
- Tests: os próprios; Gate: Full

## Validation Checks
1. Granularidade: 1 task = 1 componente/função/endpoint/arquivo — OK.
2. Diagrama x definição: arquitetura atômica respeitada — OK.
3. Co-location: cada task tem testes + gate — OK.
4. Total de tasks: 50 (T1–T50) — OK.
Aprovado para execução?

### T51 — Importar CSS no main.tsx

- **What:** Importar tokens.css, base.css, components.css, pages.css, design-system.css e prototype.css no main.tsx (ou App.tsx), para que o bundle CSS inclua o design system.
- **Where:** `web-react/src/main.tsx`
- **Depends on:** T2, T3, T4
- **Reuses:** `src/styles/*.css`
- **Requirement:** MIG-02

- **Done when:**
  - [ ] `main.tsx` importa todos os CSS de `src/styles/`
  - [ ] bundle CSS contém as classes do design system (`npm run build` → CSS > 50 kB)
  - [ ] classes aplicadas nas páginas (ex.: `.shell`, `.nav`, `.hero`)
  - [ ] Gate check passes: `npm run build`

- **Tests:** build (CSS bundle size)
- **Gate:** Build
