import { useState } from "react";

interface NavLink {
  label: string;
  href: string;
}

const links: NavLink[] = [
  { label: "Início", href: "/" },
  { label: "Buscar um Terreiro", href: "/search" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav" aria-label="Principal">
      <div className="shell nav__in">
        <a className="nav__brand" href="/" aria-label="Cadterreiros">
          <span className="nav__word">Cadterreiros</span>
        </a>
        <div className="nav__links">
          {links.map((l) => (
            <a key={l.href} className="nav__link" href={l.href}>
              {l.label}
            </a>
          ))}
          <a className="nav__link nav__cta" href="/login">
            Login
          </a>
        </div>
        <button
          type="button"
          className="nav__burger"
          aria-expanded={open}
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && (
        <div className="nav__drawer">
          {links.map((l) => (
            <a key={l.href} className="nav__link" href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a className="nav__link" href="/login" onClick={() => setOpen(false)}>
            Login
          </a>
        </div>
      )}
    </nav>
  );
}

export default Nav;