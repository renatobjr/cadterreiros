import { useEffect } from "react";

const BRAND = "Cadterreiros";
const HOME_TITLE = `${BRAND} — acervo de terreiros de matriz africana`;
const SUFFIX = ` · ${BRAND}`;

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

/** Título do documento para uma rota (sem query/hash). */
export function titleForPath(pathname: string): string {
  const path = (pathname.split(/[?#]/)[0] || "/").replace(/\/+$/, "") || "/";
  if (path === "/") return HOME_TITLE;
  const exact = EXACT[path];
  if (exact) return `${exact}${SUFFIX}`;
  const dynamic = DYNAMIC.find(([prefix]) => path.startsWith(prefix));
  if (dynamic) return `${dynamic[1]}${SUFFIX}`;
  return `Página não encontrada${SUFFIX}`;
}

export function useDocumentTitle(pathname: string): void {
  useEffect(() => {
    document.title = titleForPath(pathname);
  }, [pathname]);
}
