# ROADMAP — próximas fases (retomar em 28/10/2026)

Contexto: 53 de 58 tarefas do plano `MIG` concluídas. Seguir **na ordem abaixo**.
Estado de referência no momento em que este arquivo foi escrito:

- gates: `verify-paths` 🟢 · `verify-contrast` 🟢 · `verify-tokens` 🔴 · `verify-classes` 🔴
- build: ok, com aviso de chunk > 500 kB (Leaflet + painel no mesmo bundle)
- testes: 198 verdes · **12 falhas pré-existentes** (`Home` 9, `MappingFlow` 1, `Nav` 2)
- API: 86/86 verdes

---

## Fase 4 — Fechar o plano formal (T46–T50)

| Tarefa | O que fazer |
|---|---|
| **T46** `verify-tokens` | tratar variáveis dinâmicas (`--dot`, `--n-*`, `--od-icon-size`) como permitidas no gate e remover/justificar tokens de mapa sem uso (`--map-coast`, `--map-river`, `--map-sea`, `--n-*`) |
| **T47** `verify-classes` | criar as regras faltantes (`admin-detail-head`, `admin-panel--queue`, `cadastro-aside--rest`, `mapping`, `od-stat`, `stat`) ou remover as classes do JSX; limpar as ~100 classes órfãs no CSS |
| **T48** `verify-paths` + build | paths ok; resolver o warning de bundle com `React.lazy` em `/admin` e no mapa |
| **T49** CookieBanner | banner fixo (Aceitar/Rejeitar/Personalizar) + link “Preferências de cookies” no rodapé; persistência em `localStorage` (`cadterreiros.consent`). **Decisão tomada:** migrar o GA4 do app Vue (ver bloco abaixo) com Consent Mode v2 |
| **T50** CookieBanner tests | render, aceitar, rejeitar e persistência |

## Fase 5 — Estabilização (bloqueia o cutover)

### 5.0 Sessão sem flicker + estados de carregamento (novo)

**Problema observado**: usuário logado clica em “Entrar” → a tela de login pisca
antes de redirecionar para `/admin`.

**Causa**: o `AuthProvider` começa anônimo e valida a sessão de forma assíncrona
(`validate-token`); `Login` e `RequireAdmin` não esperam `restoring`.

**Correção**:
1. Criar `PageLoader` (composed) no padrão do projeto: marca da Casa de Cultura
   (`cad.logo.svg` / `cad.white.svg`) + **spinner** (anel girando em
   `--accent`, sem texto visível), `role="status"`, `aria-live="polite"` e
   nome acessível por texto visualmente oculto/`aria-label="Carregando"`,
   altura mínima de viewport parcial e respeito a `prefers-reduced-motion`
   (queda para a marca estática + barra de progresso quando o movimento é
   reduzido).
2. Usar o `PageLoader` em: `Login` (enquanto `restoring`), `RequireAdmin`,
   carregamento dos dados do painel (visão geral, listagens, ficha, edição,
   usuários) e em qualquer rota com dados assíncronos.
3. `Login`: se `restoring`, não renderizar o formulário; se `isAuth`, redirecionar
   sem montar a tela.
4. `Nav`: com sessão ativa, trocar “Entrar” pelo **nome do usuário**
   (+ acesso ao painel e “Sair”); enquanto `restoring`, renderizar um placeholder
   do mesmo tamanho para não deslocar o layout.

### 5.1 Demais itens

1. Corrigir as **12 falhas** de teste (mocks desatualizados, não bugs de tela).
2. Cobertura de testes do painel: `RequireAdmin` (guarda), listagem, ficha, edição e usuários — hoje só o `ActionMenu` tem teste.
3. Code splitting: `React.lazy` + `manualChunks` para admin e Leaflet.

## Fase 6 — Completar o painel (mock)

- Atribuir recenseador (`assign-owner` existe na API, falta UI).
- Upload/troca de foto na edição da ficha.
- Auditoria de decisões (quem aprovou/rejeitou e quando).
- Ações em lote (aprovar/rejeitar vários registros).
- Usuários: paginação, busca e proteção para não desativar a própria conta.
- Opcional: drawer “Ver histórico de ações” (hoje a linha do tempo fica no aside).

## Fase 7 — Segurança e operação

- Rate limit nas rotas privadas; cache/curto-circuito do `validate-token` (hoje 1 query por request).
- `NODE_ENV=production` + cookie `Secure` + `WEB_ORIGIN` do domínio.
- Observabilidade: logs estruturados, monitoramento de erro e do envio (Resend), backup do Mongo.
- Acessibilidade (auditoria WCAG AA) e SEO (meta/OG/sitemap/robots).

## Fase 8 — Cutover

1. Último commit migrando `web-react/` → `web/` e removendo o Vue.
2. CI (build + testes + gates) e deploy.
3. Documentação: setup do Resend, ViaCEP/Nominatim (política de uso), variáveis de ambiente.

---

## Confirmação — GA4 e cookies

**GA4 implementado é a opção B**: banner com consentimento real
(Aceitar / Rejeitar / Personalizar) + Consent Mode v2, GA4 carregado só após o
aceite e apenas na área pública. A opção A (banner informativo, sem GA) fica
descartada porque o projeto já usa GA4 desde o app Vue.

## Gate final obrigatório (antes do cutover)

Ao final de **todas** as implementações acima, executar:

1. **Code review** completo de `web-react/` e `api/` (qualidade, consistência, dívida, testes).
2. **Security review** de `web-react/` e `api/` (auth/RBAC, sessão por cookie, CSRF, uploads, exposição de dados, segredos, dependências).

Nenhuma entrega passa com gate vermelho ou achado crítico aberto.

---

## GA4 — decisão para o T49 (migrar do Vue)

**O que existe hoje em `web/` (Vue):**
- `index.html` carrega `gtag.js` **sem consentimento** com o ID fixo `G-CCSQS7ZTT2`;
- `src/main.js` faz `router.afterEach` → `gtag('config', id, { page_path })` (page_view de SPA);
- nenhum evento customizado.

**Como migrar para `web-react/` (escopo fechado):**

1. **Config**: `VITE_GA_ID` (fallback para `G-CCSQS7ZTT2`) — nada hardcoded no HTML.
2. **Consentimento**: Consent Mode v2 com `analytics_storage: "denied"` por padrão; o
   script `gtag.js` só é injetado **depois** do aceite (nada de terceiros antes disso).
3. **Só área pública**: nunca rastrear `/admin*`, `/entrar`, `/esqueci-minha-senha`,
   `/primeiro-acesso`, `/otp*`, `/set-password*`, `/design-system`.
4. **Page views**: `send_page_view: false` + `page_view` manual por rota (evita dupla contagem).
5. **Eventos recomendados** (sem PII):
   - `search` → termo + nº de resultados (busca);
   - `view_item` → ficha do terreiro (slug, nação);
   - `select_content` → clique no card (origem: home/busca/relacionados);
   - `generate_lead` → cadastro voluntário enviado (apenas cidade);
   - `filter_apply` → filtros do mapeamento.
6. **Proibido no GA**: e-mail, telefone, endereço, nome de liderança, qualquer campo do censo.
7. **Testes**: helpers puros (`isTrackablePath`, consent) + banner (aceitar/rejeitar/personalizar).

**Privacidade**: cookie de sessão do painel é essencial (fora do consentimento); a
escolha fica em `cadterreiros.consent` e pode ser revista no rodapé.
