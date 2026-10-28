/* Gera dist/sitemap.xml depois do build.
 *
 * Inclui as rotas públicas fixas, os artigos e todas as fichas aprovadas
 * (a listagem pública já filtra por `censusStep=approved` no servidor).
 * Se a API não responder, o sitemap sai só com as rotas estáticas — o deploy
 * não quebra por causa do SEO.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://cadterreiros.cciao.org"
).replace(/\/+$/, "");

const API = (process.env.API_URL || `${SITE}/api/v1`).replace(/\/+$/, "");

const STATIC_ROUTES = [
  "/",
  "/buscar",
  "/mapeamento",
  "/artigos",
  "/sobre-o-projeto",
  "/sobre-a-cciao",
  "/cadastro-voluntario",
];

/* Slugs de src/features/articles/data.ts (conteúdo estático do bundle). */
const ARTICLE_ROUTES = [
  "/artigos/comunidades-tradicionais",
  "/artigos/linguas-do-candomble",
  "/artigos/nacoes-do-candomble",
];

const escapeXml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

async function fetchApprovedCommunities() {
  try {
    const response = await fetch(`${API}/religious-communities/public/list`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const list = payload?.data?.data ?? payload?.data;
    if (!Array.isArray(list)) return [];
    return list
      .map((item) => item?.slugify)
      .filter((slug) => typeof slug === "string" && slug.length > 0);
  } catch (error) {
    console.warn(
      `[sitemap] API indisponível (${error?.message ?? error}); gerando só rotas estáticas.`,
    );
    return [];
  }
}

const communityRoutes = (await fetchApprovedCommunities()).map(
  (slug) => `/terreiro/${slug}`,
);

const routes = [...STATIC_ROUTES, ...ARTICLE_ROUTES, ...communityRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(`${SITE}${route}`)}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const output = path.resolve("dist/sitemap.xml");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, xml, "utf8");

console.log(
  `[sitemap] ${routes.length} URLs (${communityRoutes.length} fichas) em ${output}`,
);
