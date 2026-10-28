import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ArrowIcon from "../../../components/ui/ArrowIcon";
import cadWhite from "../../../assets/img/logos/cad.white.svg";

export interface AuthShellProps {
  children: ReactNode;
}

/**
 * Moldura das telas de acesso, fiel ao mock: painel institucional à esquerda,
 * cartão do formulário à direita, link de volta ao site e nota de política.
 *
 * Enquanto está montada, aplica `auth-mode` no `<body>` — o CSS usa essa
 * classe para esconder a navegação e o rodapé do site público.
 */
export function AuthShell({ children }: AuthShellProps) {
  useEffect(() => {
    document.body.classList.add("auth-mode");
    return () => document.body.classList.remove("auth-mode");
  }, []);

  return (
    <main className="auth-shell">
      <aside className="auth-brand">
        <div className="auth-brand__top">
          <img
            className="auth-brand__mark"
            src={cadWhite}
            alt=""
            width={56}
            height={56}
          />
          <p className="eyebrow">Acesso da curadoria</p>
          <p className="auth-brand__word">Cadterreiros</p>
          <p className="auth-brand__phrase">
            Um registro vivo das comunidades de matriz africana.
          </p>
        </div>
        <div className="auth-brand__meta">
          <span>Recenseamento · Região Metropolitana de João Pessoa</span>
          <span>Casa de Cultura Ilê Asé D&apos;Osoguian</span>
        </div>
      </aside>

      <section className="auth-panel">
        <Link className="auth-back" to="/">
          Voltar ao site <ArrowIcon />
        </Link>
        <div className="auth-card">{children}</div>
        <p className="auth-policy meta">
          Acesso restrito à equipe de curadoria e aos recenseadores do
          Cadterreiros.
        </p>
      </section>
    </main>
  );
}

export default AuthShell;
