# .artifacts — espelho normativo do protótipo open-design

Espelho **somente-leitura** dos insumos visuais do projeto open-design
`7c400af0-7421-4302-a8b4-99cb474a76a7` (reconstrução React da identidade nova).
É a **referência visual** do `web-react/`. Lógica/JSX do protótipo **não**
é portada — ver `web-react/AGENT.md`.

Projeto origem (consulta, nunca edição):
`/media/files/antimonitor/open-design/.od/projects/7c400af0-7421-4302-a8b4-99cb474a76a7`

## O que está aqui e por quê

| Caminho | Origem | Papel |
|---|---|---|
| `brand-spec.md` | raiz do OD | Especificação da identidade (tokens, tipo, ritmo, regras) |
| `tokens.mjs` | `scripts/tokens.mjs` | **FONTE dos tokens** — base do pipeline `tokens → tokens.css` no scaffold |
| `css/` | `assets/css/` | CSS de referência (base, components, pages, design-system, tokens gerado, **prototype** consolidado) |
| `fonts/` | `assets/fonts/` | 19 woff2 auto-hospedados + `@font-face` (zero hotlink) |
| `scripts/` | `scripts/` | Pipeline e gates a portar (`build-tokens`, `verify-*`, `build-metrics`, `color`); `bundle.mjs`/`serve.mjs` **não** se aplicam |
| `data/` | `data/` | Snapshot saneado (214 registros, 2026-10-01) + `knownIssues` — documenta o formato esperado da API e as regras de saneamento |

## O que NÃO está aqui (de propósito)

- `app/*.jsx` — JSX do protótipo não é copiado (referência visual apenas, consultar na origem).
- `assets/images/terreiros/` (199 fotos) — produção usa o CDN da API (`VITE_IMG_RELIGIOUS_COMMUNITY_URL`).
- `vendor/`, `app/bundle.jsx` — runtime demo, descartado.
- `source/` — clone do Vue original; a referência de comportamento viva é `web/` + API.

## Regras

1. **Nunca editar nada aqui** para "ajustar" o front. Mudança visual nasce em
   `tokens.mjs` (futura casa: `web-react/scripts/`) e no CSS do app.
2. Se a origem OD evoluir, re-espelhar com `cp` e registrar data/origem no commit.
3. `tokens.css` é **gerado** — no scaffold ele será regenerado pelo pipeline, não copiado à mão.
