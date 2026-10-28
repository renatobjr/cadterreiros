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
| **T49** CookieBanner | banner fixo (Aceitar/Rejeitar/Personalizar), persistência em `localStorage` (`cadterreiros.consent`). **Decisão pendente:** não existe `gtag` no projeto — integrar Consent Mode v2 só se houver analytics; caso contrário, banner informativo |
| **T50** CookieBanner tests | render, aceitar, rejeitar e persistência |

## Fase 5 — Estabilização (bloqueia o cutover)

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

## Gate final obrigatório (antes do cutover)

Ao final de **todas** as implementações acima, executar:

1. **Code review** completo de `web-react/` e `api/` (qualidade, consistência, dívida, testes).
2. **Security review** de `web-react/` e `api/` (auth/RBAC, sessão por cookie, CSRF, uploads, exposição de dados, segredos, dependências).

Nenhuma entrega passa com gate vermelho ou achado crítico aberto.
