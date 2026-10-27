import logoWhite from "../../assets/img/logos/logo_white.svg";

interface FooterLink {
  label: string;
  href: string;
}

const navigateLinks: FooterLink[] = [
  { label: "Início", href: "/" },
  { label: "Buscar um terreiro", href: "/buscar" },
  { label: "Mapeamento", href: "/mapeamento" },
  { label: "Artigos", href: "/artigos" },
  { label: "Cadastro voluntário", href: "/cadastro-voluntario" },
];

const projectLinks: FooterLink[] = [
  { label: "Sobre o projeto", href: "/sobre-o-projeto" },
  { label: "Entrar na curadoria", href: "/entrar" },
];

export function Footer() {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot__grid">
          <div className="foot__brand">
            <img
              src={logoWhite}
              alt="Casa de Cultura Ilê Asé D'Osoguian"
              width={170}
              height={74}
            />
            <p>
              Organização sem fins lucrativos dedicada a promover o conhecimento
              e a preservação da cultura afro-brasileira, a igualdade racial e o
              patrimônio cultural imaterial.
            </p>
          </div>

          <div>
            <p className="foot__title">Navegar</p>
            <ul className="foot__list">
              {navigateLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="foot__title">Projeto</p>
            <ul className="foot__list">
              {projectLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
              <li>Processo Seletivo nº 01/2018</li>
              <li>Projeto BRA/15/010</li>
              <li>FUNJOPE/PB · PNUD</li>
            </ul>
          </div>
        </div>

        <div className="foot__bottom">
          <span>© 2026 Casa de Cultura Ilê Asé D&apos;Osoguian</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
