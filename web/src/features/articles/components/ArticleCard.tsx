import { Link } from "react-router-dom";
import ArrowIcon from "../../../components/ui/ArrowIcon";

export interface ArticleCardProps {
  slug: string;
  kicker: string;
  title: string;
  description: string;
  image: string;
}

/** Cartão de artigo usado na Home e, mais adiante, na listagem de Artigos. */
export function ArticleCard({
  slug,
  kicker,
  title,
  description,
  image,
}: ArticleCardProps) {
  return (
    <Link className="article-card" to={`/artigos/${slug}`}>
      <img className="article-card__img" src={image} alt="" loading="lazy" />
      <div className="article-card__body">
        <span className="article-card__kicker">{kicker}</span>
        <h3 className="article-card__title">{title}</h3>
        <p className="article-card__desc">{description}</p>
        <span className="article-card__go">
          Ler artigo <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export default ArticleCard;
