import { Link } from "react-router-dom";
import ArrowIcon from "../components/ui/ArrowIcon";
import ArticleBody from "../features/articles/components/ArticleBody";
import { ABOUT_PROJECT } from "../features/about/data";

/** Identificação institucional exibida no cabeçalho da página. */
const HEAD_META = [
  "Processo Seletivo nº 01/2018",
  "Projeto BRA/15/010",
  "Casa de Cultura Ilê Asé D'Osoguian",
];

/**
 * Página institucional "Sobre o projeto": contexto do cadastramento dos
 * terreiros de matriz africana da Região Metropolitana de João Pessoa.
 */
export function AboutProject() {
  const {
    title,
    kicker,
    description,
    image,
    leadTitle,
    lead,
    sections,
    references,
  } = ABOUT_PROJECT;

  return (
    <main>
      <div className="page-head page-head--deep">
        <div className="shell">
          <p className="eyebrow">{kicker}</p>
          <h1 className="display-1">{title}</h1>
          <p className="lede">{description}</p>
          <div className="page-head__meta meta">
            {HEAD_META.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="shell article-layout">
        <div className="article">
          <div className="notice">
            <p className="notice__title">{leadTitle}</p>
            <p>{lead}</p>
          </div>

          <img
            className="article-hero mt-6"
            src={image}
            alt=""
            width={768}
            height={480}
            loading="lazy"
          />

          <ArticleBody sections={sections} references={references} />

          <div className="mt-7">
            <Link className="btn btn--primary" to="/buscar">
              Explorar o acervo <ArrowIcon />
            </Link>{" "}
            <Link className="btn btn--ghost" to="/artigos">
              Ler os artigos
            </Link>
          </div>
        </div>

        <aside className="toc" aria-labelledby="toc-title">
          <h2 id="toc-title">Nesta página</h2>
          <ol>
            {sections.map((section, index) => (
              <li key={section.title}>
                <a href={`#secao-${index + 1}`}>{section.title}</a>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
}

export default AboutProject;
