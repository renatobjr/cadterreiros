/* SEO de build: gera dist/sitemap.xml e páginas estáticas com metadados.
 *
 * Para cada rota pública escreve `dist/<rota>/index.html` com título,
 * description, canonical, Open Graph e um fallback em <noscript>. O nginx
 * precisa de `try_files $uri $uri/ /index.html;` para servir essas pastas —
 * o JS do SPA assume a navegação normalmente.
 *
 * Se a API não responder, o sitemap sai com as rotas estáticas e o build não
 * quebra.
 */
import fs from "node:fs";
import path from "node:path";

const SITE = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  "https://cadterreiros.cciao.org"
).replace(/\/+$/, "");

const API = (process.env.API_URL || `${SITE}/api/v1`).replace(/\/+$/, "");

const STATIC_PAGES = [
  {
    route: "/",
    title: "Cadterreiros — acervo de terreiros de matriz africana",
    description:
      "Acervo do cadastramento dos terreiros de matriz africana da Região Metropolitana de João Pessoa.",
  },
  {
    route: "/buscar",
    title: "Buscar um terreiro · Cadterreiros",
    description:
      "Pesquise terreiros por nome, bairro, cidade, nação e tipo de comunidade no acervo do censo.",
  },
  {
    route: "/mapeamento",
    title: "Mapeamento dos terreiros · Cadterreiros",
    description:
      "Explore no mapa os terreiros recenseados na Região Metropolitana de João Pessoa.",
  },
  {
    route: "/artigos",
    title: "Artigos · Cadterreiros",
    description:
      "Textos sobre comunidades tradicionais, línguas rituais e nações do candomblé.",
  },
  {
    route: "/sobre-o-projeto",
    title: "Sobre o projeto · Cadterreiros",
    description:
      "Conheça o projeto de cadastramento dos terreiros de matriz africana da Paraíba.",
  },
  {
    route: "/sobre-a-cciao",
    title: "Sobre a CCIAO · Cadterreiros",
    description:
      "A Casa de Cultura Ilê Asé D'Osoguian e sua atuação na preservação da cultura afro-brasileira.",
  },
  {
    route: "/cadastro-voluntario",
    title: "Cadastro voluntário · Cadterreiros",
    description:
      "Compartilhe os dados de uma comunidade de terreiro para avaliação da curadoria.",
  },
];

const ARTICLES = [
  {
    slug: "comunidades-tradicionais",
    title: "O que são Comunidades Tradicionais?",
    description:
      "Um olhar sobre as comunidades tradicionais de matriz africana e de terreiro no Brasil.",
  },
  {
    slug: "linguas-do-candomble",
    title: "Quais as linguagens do Candomblé?",
    description:
      "As línguas africanas nas religiões de matriz africana no Brasil.",
  },
  {
    slug: "nacoes-do-candomble",
    title: "Quais as nações do Candomblé no Brasil?",
    description:
      "Origens, divindades e práticas religiosas das nações do Candomblé.",
  },
];

const escapeXml = (value) =>
  String(value)
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
    return list.filter((item) => typeof item?.slugify === "string" && item.slugify);
  } catch (error) {
    console.warn(
      `[seo] API indisponível (${error?.message ?? error}); gerando só rotas estáticas.`,
    );
    return [];
  }
}

function canonical(route) {
  return `${SITE}${route === "/" ? "/" : route}`;
}

/** Troca (ou adiciona) uma meta tag no HTML base. */
function replaceMeta(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${key}" content="${escapeXml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`);
  return pattern.test(html)
    ? html.replace(pattern, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
}

function renderPage(baseHtml, { title, description, route, noscript }) {
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeXml(title)}</title>`)
    .replace(/<link\s+rel="canonical"[^>]*>\s*/g, "");

  html = replaceMeta(html, "name", "description", description);
  html = replaceMeta(html, "name", "robots", "index,follow");
  html = replaceMeta(html, "property", "og:title", title);
  html = replaceMeta(html, "property", "og:description", description);
  html = replaceMeta(html, "property", "og:url", canonical(route));

  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${escapeXml(canonical(route))}" />\n  </head>`,
  );

  if (noscript) {
    html = html.replace(
      "</body>",
      `    <noscript>\n      ${noscript}\n    </noscript>\n  </body>`,
    );
  }

  return html;
}

function writePage(route, html) {
  const target =
    route === "/"
      ? path.resolve("dist/index.html")
      : path.resolve("dist", route.replace(/^\//, ""), "index.html");

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html, "utf8");
}

const baseHtml = fs.readFileSync(path.resolve("dist/index.html"), "utf8");
const communities = await fetchApprovedCommunities();

for (const page of STATIC_PAGES) {
  if (page.route === "/") continue;
  writePage(
    page.route,
    renderPage(baseHtml, {
      ...page,
      noscript: `<strong>${escapeXml(page.title)}</strong><p>${escapeXml(
        page.description,
      )}</p>`,
    }),
  );
}

for (const article of ARTICLES) {
  const route = `/artigos/${article.slug}`;
  writePage(
    route,
    renderPage(baseHtml, {
      route,
      title: `${article.title} · Cadterreiros`,
      description: article.description,
      noscript: `<h1>${escapeXml(article.title)}</h1><p>${escapeXml(
        article.description,
      )}</p>`,
    }),
  );
}

for (const community of communities) {
  const route = `/terreiro/${community.slugify}`;
  const city =
    community.city ?? community.communityAddress?.city ?? "João Pessoa";
  const nation = community.religiousSpaceNation ?? "";
  const description = [
    community.religiousSpaceName,
    city ? `— ${city}` : "",
    nation ? `· nação ${nation}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .concat(". Ficha pública do censo de terreiros da Paraíba.");

  writePage(
    route,
    renderPage(baseHtml, {
      route,
      title: `${community.religiousSpaceName} · Cadterreiros`,
      description,
      noscript: `<h1>${escapeXml(community.religiousSpaceName)}</h1><p>${escapeXml(
        `${city}${nation ? ` · nação ${nation}` : ""}`,
      )}</p><p>Ficha pública do censo de terreiros da Paraíba.</p>`,
    }),
  );
}

const routes = [
  ...STATIC_PAGES.map((page) => page.route),
  ...ARTICLES.map((article) => `/artigos/${article.slug}`),
  ...communities.map((community) => `/terreiro/${community.slugify}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(canonical(route))}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

fs.writeFileSync(path.resolve("dist/sitemap.xml"), xml, "utf8");

console.log(
  `[seo] ${routes.length} URLs (${communities.length} fichas) · sitemap e páginas estáticas prontos`,
);
