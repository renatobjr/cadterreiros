import { Link } from "react-router-dom";

/** Resposta para endereços que não correspondem a nenhuma rota do site. */
export function NotFound() {
  return (
    <main>
      <header className="page-head">
        <div className="shell">
          <p className="eyebrow">Erro 404</p>
          <h1 className="display-1">Página não encontrada</h1>
          <p className="lede">
            O endereço acessado não existe ou foi movido. Verifique o link ou
            volte para o início.
          </p>
          <p className="mt-6">
            <Link className="pill-link" to="/">
              Voltar ao início
            </Link>
          </p>
        </div>
      </header>
    </main>
  );
}

export default NotFound;
