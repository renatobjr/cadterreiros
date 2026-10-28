import { Link } from "react-router-dom";

/**
 * Página institucional da Casa de Cultura Ilê Asé D'Osoguian (CCIAO),
 * entidade executora do cadastramento na Paraíba.
 */
export function AboutCCIAO() {
  return (
    <main>
      <div className="shell">
        <nav className="crumbs meta" aria-label="Trilha de navegação">
          <Link to="/">Início</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Sobre a CCIAO</span>
        </nav>
      </div>

      <header className="page-head">
        <div className="shell">
          <p className="eyebrow">Entidade executora</p>
          <h1 className="display-1">
            Casa de Cultura Ilê Asé D&apos;Osoguian
          </h1>
          <p className="lede">
            Organização da sociedade civil que executa o cadastramento dos
            terreiros de matriz africana na Paraíba.
          </p>
        </div>
      </header>

      <div className="shell article-layout">
        <article className="article">
          <h2>Quem é a CCIAO</h2>
          <p>
            A Casa de Cultura Ilê Asé D&apos;Osoguian (CCIAO) é uma
            organização da sociedade civil sem fins lucrativos dedicada à
            preservação e à valorização da cultura afro-brasileira e das
            tradições de matriz africana. Atua no fortalecimento das
            comunidades de terreiro, no reconhecimento de seus saberes
            ancestrais e no enfrentamento à intolerância religiosa.
          </p>

          <h2>Trajetória</h2>
          <p>
            Antes deste projeto, a CCIAO realizou um mapeamento inicial de
            terreiros no município de João Pessoa, entre 2011 e 2012, com o
            apoio institucional do Ministério da Cultura (MinC), do
            Ministério do Desenvolvimento Social (MDS) e da Fundação
            Cultural de João Pessoa (FUNJOPE/PB).
          </p>
          <p>
            A experiência acumulada nessa etapa levou a CCIAO a ser
            selecionada, no âmbito do Processo Seletivo nº 01/2018 (Projeto
            BRA/15/010), para conduzir o cadastramento dos terreiros de
            matriz africana na Paraíba.
          </p>

          <h2>O papel no projeto</h2>
          <p>
            Cabe à CCIAO a execução do recenseamento: mobilizar as
            comunidades, aplicar o formulário de cadastro, organizar e
            qualificar os dados coletados e devolver à sociedade informações
            públicas sobre a presença e a diversidade dos terreiros
            paraibanos.
          </p>
          <p>
            O trabalho é orientado pelo respeito às lideranças e às
            comunidades cadastradas, pela transparência no uso das
            informações e pela valorização do patrimônio cultural imaterial
            afro-brasileiro.
          </p>

          <h2>Saiba mais</h2>
          <p>
            Conheça os objetivos e o contexto institucional do projeto na
            página <Link to="/sobre-o-projeto">Sobre o projeto</Link>.
          </p>
        </article>
      </div>
    </main>
  );
}

export default AboutCCIAO;
