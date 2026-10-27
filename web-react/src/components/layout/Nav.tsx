import { useState } from "react";

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

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="shell nav__in">
        <a className="nav__brand" href="/" aria-label="Cadterreiros, início">
          <span className="nav__brand-text">
            <span className="nav__word">Cadterreiros</span>
            <span className="nav__sub">Casa de Cultura Ilê Asé D&apos;Osoguian</span>
          </span>
        </a>

        <nav className="nav__links" aria-label="Navegação principal">
          {links.map((l) => (
            <a key={l.href} className="nav__link" href={l.href}>
              {l.label}
            </a>
          ))}
          <a className="nav__link nav__login" href={enterLink.href}>
            {enterLink.label}
          </a>
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
            <a key={l.href} className="nav__link" href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a
            className="nav__link nav__login"
            href={enterLink.href}
            onClick={() => setOpen(false)}
          >
            {enterLink.label}
          </a>
        </nav>
      )}
    </header>
  );
}

export default Nav;
