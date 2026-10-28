import { useEffect } from "react";
import { isTrackablePath } from "../features/analytics/consent";

const BRAND = "Cadterreiros";
const HOME_TITLE = `${BRAND} — acervo de terreiros de matriz africana`;
const SUFFIX = ` · ${BRAND}`;

const DEFAULT_DESCRIPTION =
  "Acervo do cadastramento dos terreiros de matriz africana da Região Metropolitana de João Pessoa, realizado pela Casa de Cultura Ilê Asé D'Osoguian.";

/** Origem pública usada em canonical/OG. Configurável no build. */
export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ??
  "https://cadterreiros.cciao.org"
).replace(/\/+$/, "");

/** Títulos por rota — também alimentam o `page_title` do GA4. */
const EXACT: Record<string, string> = {
  "/buscar": "Buscar um terreiro",
  "/mapeamento": "Mapeamento dos terreiros",
  "/artigos": "Artigos",
  "/sobre-o-projeto": "Sobre o projeto",
  "/sobre-a-cciao": "Sobre a CCIAO",
  "/cadastro-voluntario": "Cadastro voluntário",
  "/entrar": "Entrar no painel",
  "/esqueci-minha-senha": "Recuperar acesso",
  "/primeiro-acesso": "Primeiro acesso",
  "/admin": "Painel da curadoria",
  "/admin/cadastros": "Cadastros (painel)",
  "/admin/usuarios": "Equipe (painel)",
  "/design-system": "Design system",
};

const DYNAMIC: Array<[prefix: string, title: string]> = [
  ["/terreiro/", "Ficha do terreiro"],
  ["/artigos/", "Artigo"],
  ["/admin/cadastros/", "Cadastro (painel)"],
  ["/otp", "Verificação de código"],
  ["/set-password", "Definir senha"],
];

const DESCRIPTIONS: Record<string, string> = {
  "/buscar":
    "Pesquise terreiros por nome, bairro, cidade, nação e tipo de comunidade no acervo do censo.",
  "/mapeamento":
    "Explore no mapa os terreiros recenseados na Região Metropolitana de João Pessoa, com filtros por cidade, nação e tipo.",
  "/artigos":
    "Textos sobre comunidades tradicionais, línguas rituais e nações do candomblé.",
  "/sobre-o-projeto":
    "Conheça o projeto de cadastramento dos terreiros de matriz africana da Paraíba.",
  "/sobre-a-cciao":
    "A Casa de Cultura Ilê Asé D'Osoguian e sua atuação na preservação da cultura afro-brasileira.",
  "/cadastro-voluntario":
    "Compartilhe os dados de uma comunidade de terreiro para avaliação da curadoria.",
};

const DYNAMIC_DESCRIPTIONS: Array<[prefix: string, description: string]> = [
  [
    "/terreiro/",
    "Dados públicos do censo: nação, fundação, território e história da comunidade de terreiro.",
  ],
  ["/artigos/", "Artigo do acervo Cadterreiros."],
];

function normalizePath(pathname: string): string {
  const path = (pathname.split(/[?#]/)[0] || "/").replace(/\/+$/, "");
  return path || "/";
}

/** Título do documento para uma rota (sem query/hash). */
export function titleForPath(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "/") return HOME_TITLE;
  const exact = EXACT[path];
  if (exact) return `${exact}${SUFFIX}`;
  const dynamic = DYNAMIC.find(([prefix]) => path.startsWith(prefix));
  if (dynamic) return `${dynamic[1]}${SUFFIX}`;
  return `Página não encontrada${SUFFIX}`;
}

/** Descrição para `meta description` e Open Graph. */
export function descriptionForPath(pathname: string): string {
  const path = normalizePath(pathname);
  if (path === "/") return DEFAULT_DESCRIPTION;
  const exact = DESCRIPTIONS[path];
  if (exact) return exact;
  const dynamic = DYNAMIC_DESCRIPTIONS.find(([prefix]) => path.startsWith(prefix));
  return dynamic?.[1] ?? DEFAULT_DESCRIPTION;
}

/** Rotas privadas (painel/auth) não devem ser indexadas. */
export function isIndexablePath(pathname: string): boolean {
  return isTrackablePath(normalizePath(pathname));
}

export function canonicalForPath(pathname: string): string {
  return `${SITE_URL}${normalizePath(pathname)}`;
}

/* ---------- escrita no <head> ---------- */

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let element =
    document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

export interface SeoOverride {
  title?: string;
  description?: string;
}

/**
 * Aplica título, descrição, canonical, robots e Open Graph para a rota.
 *
 * A SPA não tem SSR: estes valores são atualizados no cliente. Para crawlers
 * que não executam JS, o `index.html` mantém os metadados padrão e o sitemap
 * garante a descoberta das URLs.
 */
export function applySeo(pathname: string, override: SeoOverride = {}): void {
  const path = normalizePath(pathname);
  const title = override.title ?? titleForPath(path);
  const description = override.description ?? descriptionForPath(path);
  const canonical = canonicalForPath(path);

  document.title = title;
  upsertMeta("name", "description", description);
  upsertMeta(
    "name",
    "robots",
    isIndexablePath(path) ? "index,follow" : "noindex,nofollow",
  );
  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", description);
  upsertMeta("property", "og:url", canonical);
  upsertMeta("property", "og:type", "website");
  upsertMeta("name", "twitter:card", "summary_large_image");
  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", description);
  upsertCanonical(canonical);
}

/** Aplica o SEO padrão da rota a cada navegação. */
export function useDocumentSeo(pathname: string): void {
  useEffect(() => {
    applySeo(pathname);
  }, [pathname]);
}
