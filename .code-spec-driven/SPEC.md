# Migração Vue 3 → React 18 + TypeScript + Vite (web-react) — Specification

**Repos:** `/media/files/antimonitor/projects/cadterreiros` (primário) + `/media/files/antimonitor/open-design` (referência visual)
**Auto-sizing:** Large
**Fonte:** Task interna (sem Asana) — contexto: `web-react/AGENT.md`, `.artifacts/`, open-design mock `bd938936`
**Responsavel:** Equipe de desenvolvimento
**Prazo:** Sem prazo definido

---

## Problem Statement

O front-end atual (`web/`, Vue 3 + Vite) precisa ser substituído por uma reconstrução em React 18 + TypeScript + Vite (`web-react/`) para alinhar com a nova identidade visual (`brand-spec.md` / `.artifacts/`) e preparar o cutover. A migração deve preservar todos os fluxos, validações, endpoints e permissões existentes, além de introduzir melhorias na API (cadastro voluntário público, endpoint dos 9 mais antigos, gráficos de mapeamento, segurança). Sem essa migração, a identidade nova não pode ser publicada e o acervo não ganha cadastro voluntário nem analytics de mapeamento.

---

## Goals

- [ ] Scaffold `web-react/` com Vite + React 18 + TS + ESLint + Vitest, seguindo a arquitetura atômica do `AGENT.md` §2.2
- [ ] Portar a identidade visual (tokens, CSS, fontes, brand-spec) para `web-react/` com paridade verificada por gates
- [ ] Reimplementar todas as telas públicas (Início, Buscar, Mapeamento, Artigos, Sobre, Cadastro voluntário, Terreiro) em React
- [ ] Reimplementar telas de auth (Login, OTP, SetPassword, Primeiro acesso, Esqueci senha) na identidade nova
- [ ] Adicionar rotas públicas + auth + redirects legados (conforme AGENT.md §3)
- [ ] Adicionar endpoints na API: `/public/oldest`, `/public/create`, `/public/stats/*`, `/public/upload-main-picture/:id`
- [ ] Adicionar prop `registeredVoluntarily` e tornar `censusTaker` opcional no schema
- [ ] Adicionar segurança: rate-limit + header `x-cadterreiros-api` + validação strict (class-validator)
- [ ] Testes (Vitest + Testing Library) para fluxos reais contra a API
- [ ] Build local limpo + gates verdes

---

## Out of Scope

| Item | Motivo |
|------|--------|
| Área `/admin` (curadoria) | Fase 2 conforme AGENT.md §3 |
| Migração do backend (`api/`) além dos endpoints listados | API permanece intocada salvo necessidade explícita |
| Novas features além da migração | Escopo fechado na migração |
| LeaderContacts (telefone/e-mail) no front público | Dado pessoal — não reintroduzir |

---

## Assumptions & Open Questions

| Premissa / decisão | Valor adotado | Justificativa | Confirmado? |
|--------------------|---------------|---------------|-------------|
| Auto-sizing | Large | Multi-componente, multi-camada (front + API) | sim |
| Fonte de verdade visual | `.artifacts/` + `brand-spec.md` | README do .artifacts | sim |
| Fonte de verdade comportamental | `web/` (Vue) + `api/` | AGENT.md §1 | sim |
| Framework CSS | Nenhum (CSS puro + tokens) | AGENT.md §2.3 | sim |
| Biblioteca de componentes | Nenhuma (átomos do zero) | AGENT.md §2.3 | sim |
| Estado global | Context (auth) + colocation | AGENT.md §2.1.4 | sim |
| HTTP client | axios (já usado no Vue) | AGENT.md §2.3 | sim |
| Mapa | Leaflet + markercluster | AGENT.md §2.3 | sim |
| censusTaker para cadastro voluntário | Opcional (default null) | Decisão do usuário | sim |
| Validação strict | class-validator (nova dep) | Decisão do usuário | sim |
| Rate-limit | 5 req/min por IP no `/public/create` | Decisão do usuário | sim |
| Header `x-cadterreiros-api` | Valor fixo por ambiente (env var) | Decisão do usuário | sim |
| Foto no cadastro voluntário | Permitir upload público (com segurança) | Decisão do usuário | sim |
| `/public/random` | Removido (substituído por `/public/oldest`) | Decisão do usuário | sim |
| `/public/mapping` | Unificado em `/public/stats/summary` | Decisão do usuário | sim |
| `by-neighborhood` | Top 10 + "outros" | Decisão do usuário | sim |
| `by-census-taker` (admin) | Não implementar | Decisão do usuário | sim |
| Imagens do mock | Revalidar contra API real (0 de 199 UUIDs batem) | Descoberta na análise | não |

**Open questions:** Nenhuma — todas resolvidas ou documentadas acima.

---

## User Stories

### P1: Scaffold e identidade visual ⭐ MVP

**User Story:** COMO desenvolvedor, QUERO um scaffold React 18 + TS + Vite com tokens/CSS/fontes portados, PARA QUE as telas possam ser construídas na identidade nova.

**Acceptance Criteria:**
1. WHEN o scaffold é criado THEN system SHALL ter `src/components/ui/`, `src/components/composed/`, `src/components/layout/`, `src/features/`, `src/pages/`, `src/api/`, `src/domain/`, `src/styles/`
2. WHEN `npm run build` roda THEN system SHALL compilar sem erros
3. WHEN `npm run lint` roda THEN system SHALL passar sem warnings
4. WHEN tokens.css é gerado THEN system SHALL ser idêntico ao `tokens.mjs` (gate verify-tokens passa)
5. WHEN as fontes são servidas THEN system SHALL usar os 19 woff2 auto-hospedados (zero hotlink)

**Independent Test:** `npm ci && npm run build` limpo + `node scripts/verify-tokens.mjs` passa.

---

### P1: Portar CSS e componentes atômicos ⭐ MVP

**User Story:** COMO desenvolvedor, QUERO os CSS de referência (base, components, pages, design-system, tokens) portados e componentes atômicos criados, PARA QUE as telas possam ser montadas.

**Acceptance Criteria:**
1. WHEN o CSS é portado THEN system SHALL manter todas as classes de `.artifacts/css/` (base 470, components 775, pages 433, design-system 374 linhas)
2. WHEN um componente atômico é criado THEN system SHALL seguir a hierarquia `ui/` → `composed/` → `layout/` → `features/` → `pages/`
3. WHEN um componente usa estilo THEN system SHALL usar classes CSS existentes ou seguir a nomenclatura (bloco `__` elemento)
4. WHEN contraste é verificado THEN system SHALL passar 39 pares AA (gate verify-contrast)

**Independent Test:** `node scripts/verify-classes.mjs` e `node scripts/verify-contrast.mjs` passam.

---

### P1: Implementar telas públicas ⭐ MVP

**User Story:** COMO visitante, QUERO navegar pelas telas públicas (Início, Buscar, Mapeamento, Artigos, Sobre, Cadastro voluntário, Terreiro), PARA QUE eu possa conhecer e cadastrar terreiros.

**Acceptance Criteria:**
1. WHEN a rota `/` é acessada THEN system SHALL exibir a home com hero, stats (4 números), "Conheça alguns dos terreiros" (9 mais antigos) e mapeamento em números
2. WHEN a rota `/buscar` é acessada THEN system SHALL exibir busca com filtros (nome, bairro, cidade, nação, tipo) e paginação
3. WHEN a rota `/mapeamento` é acessada THEN system SHALL exibir mapa + 4 gráficos (nação, cidade, década, tipo×nação)
4. WHEN a rota `/artigos` é acessada THEN system SHALL exibir lista de artigos
5. WHEN a rota `/sobre-o-projeto` é acessada THEN system SHALL exibir o artigo sobre o projeto
6. WHEN a rota `/cadastro-voluntario` é acessada THEN system SHALL exibir formulário multi-step de cadastro
7. WHEN a rota `/terreiro/:slug` é acessada THEN system SHALL exibir a ficha completa do terreiro
8. WHEN a rota `/buscar` filtra THEN system SHALL atualizar os resultados sem reload (SPA)
9. WHEN um link legado é acessado (`/busca`, `/:id/:slug`, `/login`) THEN system SHALL redirecionar para a rota nova

**Independent Test:** Navegar por todas as rotas públicas e verificar que renderizam com dados reais da API.

---

### P1: Implementar rotas e redirects ⭐ MVP

**User Story:** COMO desenvolvedor, QUERO as rotas públicas + auth + redirects legados configurados, PARA QUE a navegação funcione como no Vue.

**Acceptance Criteria:**
1. WHEN o router é configurado THEN system SHALL ter todas as rotas públicas do AGENT.md §3
2. WHEN uma rota legada é acessada THEN system SHALL redirecionar (301 ou client-side)
3. WHEN uma rota inexistente é acessada THEN system SHALL exibir 404

**Independent Test:** Teste de rota para cada URL listada no AGENT.md §3.

---

### P2: Implementar telas de auth

**User Story:** COMO usuário da equipe, QUERO fazer login (e-mail + senha + OTP), recuperar senha e definir senha, PARA QUE eu possa acessar a área da curadoria.

**Acceptance Criteria:**
1. WHEN `/entrar` é acessado THEN system SHALL exibir formulário de login
2. WHEN credenciais válidas são submetidas THEN system SHALL enviar OTP e exibir campo de verificação
3. WHEN OTP válido é submetido THEN system SHALL criar sessão e redirecionar
4. WHEN `/esqueci-minha-senha` é acessado THEN system SHALL exibir formulário de recuperação
5. WHEN `/set-password/:token` é acessado THEN system SHALL exibir formulário de definição de senha
6. WHEN `/primeiro-acesso` é acessado THEN system SHALL exibir fluxo de primeiro acesso

**Independent Test:** Fluxo completo de login → sessão → logout.

---

### P2: Implementar cadastro voluntário público

**User Story:** COMO visitante, QUERO cadastrar meu terreiro voluntariamente, PARA QUE ele seja avaliado pela curadoria e entre no acervo.

**Acceptance Criteria:**
1. WHEN o formulário é preenchido e enviado THEN system SHALL chamar `POST /public/create` e exibir o protocolo (id)
2. WHEN a requisição não tem header `x-cadterreiros-api` THEN system SHALL retornar 403
3. WHEN o rate-limit é excedido (5 req/min) THEN system SHALL retornar 429
4. WHEN o payload é inválido THEN system SHALL retornar 400 com erros de validação
5. WHEN o cadastro é criado THEN system SHALL ter `censusStep: PENDING` e `registeredVoluntarily: true`
6. WHEN a foto é enviada (opcional) THEN system SHALL chamar `POST /public/upload-main-picture/:id`

**Independent Test:** POST com payload válido → 200 + id. POST sem header → 403. POST 6× em 1 min → 429.

---

### P2: Implementar seção de mapeamento com gráficos

**User Story:** COMO visitante, QUERO ver gráficos do recenseamento (nação, cidade, década, tipo×nação, tipo, gênero, etnia, linguagem, bairro, cobertura de foto), PARA QUE eu entenda a distribuição dos terreiros.

**Acceptance Criteria:**
1. WHEN `/mapeamento` é acessado THEN system SHALL exibir mapa + 10 gráficos (listados acima)
2. WHEN filtros são aplicados THEN system SHALL recalcular os gráficos
3. WHEN a API retorna dados THEN system SHALL renderizar os gráficos sem erro

**Independent Test:** Carregar `/mapeamento` e verificar que os 10 gráficos renderizam com dados reais.

---

### P2: Banner de consentimento de cookies (LGPD) ⭐

**User Story:** COMO visitante, QUERO ser informado sobre cookies e consentir antes do carregamento do GA4, PARA QUE a privacidade (LGPD) e o Google Consent Mode v2 sejam respeitados.

**Acceptance Criteria:**
1. WHEN o usuário acessa o site THEN system SHALL exibir banner de consentimento antes de carregar GA4
2. WHEN o usuário aceita THEN system SHALL atualizar consentimento (analytics_storage: granted) e carregar GA4
3. WHEN o usuário rejeita THEN system SHALL manter analytics_storage: denied e não carregar GA4
4. WHEN o usuário retorna THEN system SHALL respeitar a escolha persistida (localStorage)

**Independent Test:** Acessar o site com consentimento ausente → banner aparece; GA4 não carrega. Aceitar → GA4 carrega. Rejeitar → GA4 não carrega. Retornar → escolha persistida respeitada.

---

### P2: Implementar API — `/public/oldest` e `/public/create`

**User Story:** COMO front-end, QUERO endpoints públicos para os 9 mais antigos e cadastro voluntário, PARA QUE a home e o cadastro funcionem.

**Acceptance Criteria:**
1. WHEN `GET /public/oldest` é chamado THEN system SHALL retornar 9 terreiros com `censusStep: APPROVED`, ordenados por `religiousSpaceYearFoundation` asc, depois por nome
2. WHEN `POST /public/create` é chamado com payload válido e header `x-cadterreiros-api` THEN system SHALL criar o registro com `censusStep: PENDING`, `registeredVoluntarily: true`, `censusTaker: null`, e retornar o `id`
3. WHEN `POST /public/create` é chamado sem header THEN system SHALL retornar 403
4. WHEN `POST /public/create` é chamado 6× em 1 min THEN system SHALL retornar 429
5. WHEN `POST /public/create` é chamado com payload inválido THEN system SHALL retornar 400 com erros de validação

**Independent Test:** curl com payload válido → 200 + id. curl sem header → 403. curl 6× → 429.

---

### P2: Implementar API — endpoints de stats (públicos e admin)

**User Story:** COMO front-end, QUERO endpoints de agregação para os gráficos, PARA QUE o mapeamento não carregue 214 registros.

**Acceptance Criteria:**
1. WHEN `GET /public/stats/by-nation` é chamado THEN system SHALL retornar contagem por nação
2. WHEN `GET /public/stats/by-city` é chamado THEN system SHALL retornar contagem por cidade
3. WHEN `GET /public/stats/by-decade` é chamado THEN system SHALL retornar contagem por década
4. WHEN `GET /public/stats/by-type-and-nation` é chamado THEN system SHALL retornar contagem por tipo × nação
5. WHEN `GET /public/stats/by-type` é chamado THEN system SHALL retornar contagem por tipo
6. WHEN `GET /public/stats/by-leader-gender` é chamado THEN system SHALL retornar contagem por gênero do líder
7. WHEN `GET /public/stats/by-leader-ethnicity` é chamado THEN system SHALL retornar contagem por etnia
8. WHEN `GET /public/stats/by-language` é chamado THEN system SHALL retornar contagem por linguagem
9. WHEN `GET /public/stats/by-neighborhood` é chamado THEN system SHALL retornar top 10 bairros + "outros"
10. WHEN `GET /public/stats/photo-coverage` é chamado THEN system SHALL retornar count com/sem foto
11. WHEN `GET /public/stats/summary` é chamado THEN system SHALL retornar totais (terreiros, cidades, bairros) — substitui `/public/mapping`
12. WHEN `GET /stats/by-census-step` é chamado (auth) THEN system SHALL retornar count por censusStep
13. WHEN `GET /stats/by-status` é chamado (auth) THEN system SHALL retornar count por status
14. WHEN `GET /stats/by-educational-level` é chamado (auth) THEN system SHALL retornar count por nível educacional
15. WHEN `GET /stats/bio-coverage` é chamado (auth) THEN system SHALL retornar count com/sem bio
16. WHEN `GET /stats/voluntary-registrations` é chamado (auth) THEN system SHALL retornar count por `registeredVoluntarily`

**Independent Test:** curl cada endpoint → 200 + JSON com dados reais.

---

### P3: Implementar testes e gates

**User Story:** COMO desenvolvedor, QUERO testes e gates passando, PARA QUE a migração seja verificável.

**Acceptance Criteria:**
1. WHEN os gates rodam THEN system SHALL passar `verify-contrast` (39 pares AA), `verify-tokens`, `verify-classes`, `verify-paths`
2. WHEN os testes rodam THEN system SHALL cobrir fluxos reais (login, busca, cadastro, mapeamento)
3. WHEN o build roda THEN system SHALL compilar sem erros (`npm ci && npm run build`)

**Independent Test:** `npm run test` + `npm run build` + gates.

---

## Edge Cases

- WHEN o payload do cadastro voluntário falta campos obrigatórios THEN system SHALL retornar 400 com erros de validação
- WHEN o `religiousSpaceYearFoundation` é inválido (0, 20, ou não-numérico) THEN system SHALL tratar como "não informado"
- WHEN a API retorna erro THEN system SHALL exibir estado de erro visível (não silêncio)
- WHEN a lista de terreiros está vazia THEN system SHALL exibir empty state
- WHEN o usuário não tem sessão e acessa `/admin` THEN system SHALL redirecionar para `/entrar`
- WHEN o rate-limit é excedido THEN system SHALL retornar 429 com `Retry-After`
- WHEN o header `x-cadterreiros-api` está ausente ou inválido THEN system SHALL retornar 403
- WHEN o upload de foto falha THEN system SHALL manter o cadastro (foto não é obrigatória)
- WHEN o consentimento está ausente THEN system SHALL exibir o banner de cookies
- WHEN o usuário já consentiu THEN system SHALL não exibir o banner
- WHEN o consentimento é resetado THEN system SHALL exibir o banner novamente

---

## Requirement Traceability

| ID | Story | Fase | Status | Origem |
|----|-------|------|--------|--------|
| MIG-01 | P1: Scaffold e identidade visual | Design | Pending | AGENT.md |
| MIG-02 | P1: Portar CSS e componentes atômicos | Design | Pending | AGENT.md |
| MIG-03 | P1: Implementar telas públicas | Design | Pending | AGENT.md |
| MIG-04 | P1: Implementar rotas e redirects | Design | Pending | AGENT.md |
| MIG-05 | P2: Telas de auth | Design | Pending | AGENT.md |
| MIG-06 | P2: Cadastro voluntário público | Design | Pending | AGENT.md |
| MIG-07 | P2: Seção de mapeamento com gráficos | Design | Pending | AGENT.md |
| MIG-08 | P2: API `/public/oldest` e `/public/create` | Design | Pending | Análise mock |
| MIG-09 | P2: API endpoints de stats (públicos e admin) | Design | Pending | Análise mock |
| MIG-10 | P3: Testes e gates | Design | Pending | AGENT.md |
| MIG-11 | P2: Banner de consentimento de cookies (LGPD) | Design | Pending | AGENT.md |
**Coverage:** 11 total, 11 mapped to tasks, 0 unmapped.
---

## Success Criteria

- [ ] `web-react/` scaffold com Vite + React 18 + TS + ESLint + Vitest
- [ ] Tokens CSS gerados a partir de `tokens.mjs` (paridade verificada por gate)
- [ ] CSS de referência portado (base, components, pages, design-system, prototype)
- [ ] Fontes auto-hospedadas (19 woff2 + 2 CSS)
- [ ] Tipos de domínio em `src/domain/` espelhando payload da API
- [ ] `src/api/` com client axios + módulos por recurso
- [ ] Componentes atômicos em `src/components/ui/` e `composed/`
- [ ] Telas públicas implementadas (7 rotas)
- [ ] Telas de auth implementadas (5 rotas)
- [ ] Redirects legados funcionando
- [ ] API: `/public/oldest`, `/public/create`, `/public/stats/*`, `/public/upload-main-picture/:id`
- [ ] API: schema com `registeredVoluntarily` e `censusTaker` opcional
- [ ] API: segurança (rate-limit, header `x-cadterreiros-api`, validação strict)
- [ ] Testes (Vitest + Testing Library) para fluxos reais
- [ ] Build local limpo (`npm ci && npm run build`)
- [ ] Gates verdes (verify-contrast 39 pares AA, verify-tokens, verify-classes, verify-paths)
- [ ] Zero `console.log` commitado; erro de API vira estado visível
- [ ] Acessibilidade: label, aria-describedby, foco, aria-live, alt, contraste AA
- [ ] Banner de consentimento de cookies (LGPD) + Google Consent Mode v2: banner aparece, GA4 não carrega antes do consentimento- [ ] Tudo em pt-BR