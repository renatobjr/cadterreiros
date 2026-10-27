export function Footer() {
  return (
    <footer className="foot">
      <div className="shell">
        <div className="foot__grid">
          <div>
            <h3 className="foot__title">Cadterreiros</h3>
            <p>Mapeamento de terreiros de matriz africana.</p>
          </div>
          <div>
            <h3 className="foot__title">Links</h3>
            <ul className="foot__list">
              <li>
                <a href="/">Início</a>
              </li>
              <li>
                <a href="/search">Buscar</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="foot__title">Contato</h3>
            <ul className="foot__list">
              <li>
                <a href="mailto:contato@cadterreiros.org">contato@cadterreiros.org</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="foot__bottom">© Cadterreiros</div>
      </div>
    </footer>
  );
}

export default Footer;