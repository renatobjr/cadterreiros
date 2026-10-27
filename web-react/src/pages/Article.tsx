import { Link, useParams } from "react-router-dom";
import ArrowIcon from "../components/ui/ArrowIcon";
import ArticleBody from "../features/articles/components/ArticleBody";
import { getArticle } from "../features/articles/data";
import type { Article as ArticleModel } from "../features/articles/data";

const stripTags = (value: string): string => value.replace(/<[^>]*>/g, " ");

function readingMinutes(article: ArticleModel): number {
  const text = [
    article.description,
    article.lead,
    ...article.sections.map(
      (section) =>
        `${section.title} ${section.blocks
          .map((block) =>
            block.type === "p"
              ? block.html
              : block.type === "h3"
                ? block.text
                : block.items.join(" "),
          )
          .join(" ")}`,
    ),
  ].join(" ");
  const words = stripTags(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

/** Página de um artigo editorial; endereço desconhecido vira 404. */
export function Article() {
  const { slug } = useParams<{ slug: string }>();
  const article = getArticle(slug);

  if (!article) {
    return (
      <main>
        <header className="page-head">
          <div className="shell">
            <p className="eyebrow">Artigos</p>
            <h1 className="display-1">Artigo não encontrado</h1>
            <p className="lede">
              Não encontramos esse artigo. Ele pode ter sido movido ou o
              endereço está incompleto.
            </p>
            <p className="mt-6">
              <Link className="pill-link" to="/artigos">
                Ver todos os artigos <ArrowIcon />
              </Link>
            </p>
          </div>
        </header>
      </main>
    );
  }

  const minutes = readingMinutes(article);

  return (
    <main>
      <div className="shell">
        <nav className="crumbs meta" aria-label="Trilha de navegação">
          <Link to="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link to="/artigos">Artigos</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{article.title}</span>
        </nav>
      </div>

      <header className="article-header">
        <div className="shell">
          <p className="eyebrow">Artigo · {article.kicker}</p>
          <h1 className="display-1">{article.title}</h1>
          <p className="lede">{article.description}</p>
          <p className="meta article-header__meta">
            <span>Leitura de {minutes} min</span>
            <span>Conteúdo do projeto</span>
          </p>
        </div>
      </header>

      <div className="shell">
        <img
          className="article-hero mt-6"
          src={article.image}
          alt=""
          loading="lazy"
        />
      </div>

      <div className="shell article-layout">
        <div className="article">
          <div className="notice">
            <p className="notice__title">{article.leadTitle}</p>
            <p>{article.lead}</p>
          </div>

          <ArticleBody
            sections={article.sections}
            references={article.references}
          />
        </div>

        <aside className="toc" aria-labelledby="toc-title">
          <h2 id="toc-title">Neste artigo</h2>
          <ol>
            {article.sections.map((section, index) => (
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

export default Article;
