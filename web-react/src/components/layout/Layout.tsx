import { Outlet } from "react-router-dom";
import Nav from "./Nav";
import Footer from "./Footer";

/**
 * Estrutura comum de todas as rotas: navegação principal no topo, conteúdo
 * da rota no meio e rodapé institucional ao final.
 *
 * O conteúdo é envolvido por um `div` (e não por `main`) porque cada página
 * já declara o seu próprio `main`; aninhar landmarks seria inválido.
 */
export function Layout() {
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
    </>
  );
}

export default Layout;
