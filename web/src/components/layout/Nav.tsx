import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import cadLogo from "../../assets/img/logos/cad.logo.svg";
import { useAuth } from "../../features/auth/context";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Início", href: "/" },
  { label: "Buscar", href: "/buscar" },
  { label: "Mapeamento", href: "/mapeamento" },
  { label: "Artigos", href: "/artigos" },
  { label: "Sobre o projeto", href: "/sobre-o-projeto" },
  { label: "Cadastro voluntário", href: "/cadastro-voluntario" },
];

const enterLink: NavLink = { label: "Entrar", href: "/entrar" };

/** Primeiro nome, para o rótulo curto do menu. */
function firstName(value: string): string {
  return value.trim().split(/\s+/)[0] ?? value;
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, isAuth, restoring } = useAuth();

  /* Enquanto a sessão é validada, mantém um espaço do mesmo tamanho do link
     para o layout não pular quando o nome aparece. */
  const accountArea = restoring ? (
    <span className="nav__link nav__login nav__login--loading" aria-hidden="true" />
  ) : isAuth ? (
    <Link
      className="nav__link nav__login"
      to="/admin"
      aria-label={`Painel da curadoria — ${user?.fullname ?? user?.email ?? "sessão ativa"}`}
    >
      {firstName(user?.fullname ?? user?.email ?? "Painel")}
    </Link>
  ) : (
    <Link className="nav__link nav__login" to={enterLink.href}>
      {enterLink.label}
    </Link>
  );

  return (
    <header className="nav">
      <div className="shell nav__in">
        <Link className="nav__brand" to="/" aria-label="Cadterreiros, início">
          <img className="nav__mark" src={cadLogo} alt="" width={42} height={42} />
          <span className="nav__brand-text">
            <span className="nav__word">Cadterreiros</span>
            <span className="nav__sub">Casa de Cultura Ilê Asé D&apos;Osoguian</span>
          </span>
        </Link>

        <nav className="nav__links" aria-label="Navegação principal">
          {links.map((l) => {
            const active = location.pathname === l.href;
            return (
              <Link
                key={l.href}
                className="nav__link"
                to={l.href}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          {accountArea}
        </nav>

        <button
          type="button"
          className="nav__burger"
          aria-expanded={open}
          aria-controls="nav-drawer"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <nav className="nav__drawer" id="nav-drawer" aria-label="Navegação móvel">
          {links.map((l) => (
            <Link
              key={l.href}
              className="nav__link"
              to={l.href}
              aria-current={location.pathname === l.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {isAuth && !restoring ? (
            <Link
              className="nav__link nav__login"
              to="/admin"
              onClick={() => setOpen(false)}
            >
              {firstName(user?.fullname ?? user?.email ?? "Painel")}
            </Link>
          ) : (
            <Link
              className="nav__link nav__login"
              to={enterLink.href}
              onClick={() => setOpen(false)}
            >
              {enterLink.label}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}

export default Nav;
