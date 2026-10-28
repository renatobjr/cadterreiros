# ROADMAP — próximas fases (retomar em 28/10/2026)

Contexto: Fase 4 concluída (T46–T50) e Fase 5.0 concluída (loader + sessão).
Seguir **na ordem abaixo**.

Estado atual:

- gates: `verify-paths` 🟢 · `verify-contrast` 🟢 · `verify-tokens` 🟢 · `verify-classes` 🟢
- build: ok, sem aviso de chunk (`manualChunks`: react / leaflet / icons)
- testes: **272 verdes** em 48 arquivos
- API: 86/86 verdes

---

## Fase 4 — Fechar o plano formal (T46–T50)

| Tarefa | O que fazer |
|---|---|
| **T46** `verify-tokens` ✅ | gate passou a contar custom properties inline (`style={{ "--dot": … }}`) e prefixos dinâmicos (`--n-` cobre `--n-*`); `--map-sea/coast/river` ficaram como paleta reservada |
| **T47** `verify-classes` ✅ | classes fantasma removidas do JSX (`od-stat`, `admin-detail-head`, `admin-panel--queue`, `cadastro-aside--rest`, `mapping`) e regra `.stat` criada; zero classe usada sem estilo |
| **T48** `verify-paths` + build ✅ | paths ok; warning resolvido com `manualChunks`; `React.lazy` em admin/Leaflet fica como otimização da Fase 5 |
| **T49** CookieBanner ✅ | banner fixo (Aceitar/Rejeitar/Personalizar) + “Preferências de cookies” no rodapé; `localStorage` (`cadterreiros.consent`); GA4 com Consent Mode v2 só na área pública |
| **T50** CookieBanner tests ✅ | render, aceitar, rejeitar, personalizar, persistência e reabertura pelo rodapé |

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

1. ~~Corrigir as 12 falhas de teste~~ ✅ (mocks desatualizados, não bugs de tela).
2. Cobertura de testes do painel: `RequireAdmin` ✅, listagem ✅, ficha ✅, edição ✅, usuários ✅.
3. Code splitting: `manualChunks` ✅ + `React.lazy` para `/admin` ✅ e Leaflet ✅
   (`LazyLeafletMap`; index público caiu de 275 kB para 227 kB).

## Fase 6 — Completar o painel (mock)

- Atribuir recenseador (`assign-owner` existe na API, falta UI). ✅ diálogo na ficha (só admin, mantém status opcional)
- Upload/troca de foto na edição da ficha. ✅ campo + envio após salvar
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

**Como foi implementado em `web-react/` (T49/T50):**

- `src/features/analytics/consent.ts` — chave versionada, leitura tolerante a
  formato inválido/storage bloqueado e `isTrackablePath` (bloqueia `/admin*`,
  auth, OTP, set-password e design system).
- `src/features/analytics/ga.ts` — `gtag.js` injetado só após aceite, Consent
  Mode v2 (`analytics_storage` denied por padrão), `send_page_view: false`,
  page_view manual por rota e sanitizador de PII (chaves e valores).
- `src/features/analytics/ConsentProvider.tsx` + `context.ts` — escolha,
  reabertura e aplicação imediata do consentimento.
- `src/features/analytics/events.ts` — `search`, `view_item`, `select_content`,
  `generate_lead`, `filter_apply` (sem nome de liderança, contato ou endereço).
- `src/components/composed/CookieBanner.tsx` + CSS + link no rodapé.
- Testes: `consent.test.ts` (9), `ga.test.ts` (14), `CookieBanner.test.tsx` (6).

**Plano original de migração (referência):**

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
