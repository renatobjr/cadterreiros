import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";
import CookieBanner from "../composed/CookieBanner";
import { useConsent } from "../../features/analytics/context";
import { trackPageView } from "../../features/analytics/ga";
import { useDocumentSeo } from "../../utils/seo";

/**
 * Estrutura comum de todas as rotas: navegação principal no topo, conteúdo
 * da rota no meio e rodapé institucional ao final.
 *
 * O conteúdo é envolvido por um `div` (e não por `main`) porque cada página
 * já declara o seu próprio `main`; aninhar landmarks seria inválido.
 */
export function Layout() {
  const location = useLocation();
  const { analyticsEnabled } = useConsent();

  useDocumentSeo(location.pathname);

  /* page_view manual por rota (o GA está configurado com
     `send_page_view: false`). Rotas privadas são filtradas em `trackPageView`. */
  useEffect(() => {
    if (!analyticsEnabled) return;
    /* Espera o gtag.js processar o consentimento antes de enfileirar o
       page_view; sem isso o evento pode ser descartado na primeira visita. */
    const timer = window.setTimeout(() => trackPageView(location.pathname), 0);
    return () => window.clearTimeout(timer);
  }, [analyticsEnabled, location.pathname]);

  return (
    <>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Nav />
      <div id="conteudo" tabIndex={-1}>
        <Outlet />
      </div>
      <Footer />
      <CookieBanner />
    </>
  );
}

export default Layout;
