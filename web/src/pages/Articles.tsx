import ArticleCard from "../features/articles/components/ArticleCard";
import { ARTICLES } from "../features/articles/data";

/** Listagem pública dos artigos editoriais do projeto. */
export function Articles() {
  return (
    <main>
      <header className="page-head">
        <div className="shell">
          <p className="eyebrow">Conteúdo do projeto</p>
          <h1 className="display-1">Artigos</h1>
          <p className="lede">
            Textos de apoio para entender as comunidades tradicionais de matriz
            africana, as línguas rituais e as nações do Candomblé no Brasil.
          </p>
        </div>
      </header>

      <div className="shell page-body">
        <h2 className="skip-vis">Todos os artigos</h2>
        <div className="articles-grid">
          {ARTICLES.map((article) => (
            <ArticleCard
              key={article.slug}
              slug={article.slug}
              kicker={article.kicker}
              title={article.title}
              description={article.description}
              image={article.image}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Articles;
