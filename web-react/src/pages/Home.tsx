import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CSSProperties } from "react";
import { communitiesApi } from "../api/communities";
import ArrowIcon from "../components/ui/ArrowIcon";
import Button from "../components/ui/Button";
import EmptyState from "../components/composed/EmptyState";
import ArticleCard from "../features/articles/components/ArticleCard";
import CommunityCard from "../features/communities/components/CommunityCard";
import type {
  NationStats,
  PhotoCoverageStats,
  ReligiousCommunity,
  StatsSummary,
} from "../domain/types";

import heroImg from "../assets/img/hero.jpg";
import artigoComunidades from "../assets/img/artigo-comunidades.jpg";
import artigoLinguas from "../assets/img/artigo-linguas.jpg";
import artigoNacoes from "../assets/img/artigo-nacoes.jpg";

interface HomeData {
  summary: StatsSummary;
  photoCoverage: PhotoCoverageStats;
  nations: NationStats[];
  oldest: ReligiousCommunity[];
}

const ARTICLES = [
  {
    slug: "comunidades-tradicionais",
    kicker: "Mergulhando nas Raízes",
    title: "O que são Comunidades Tradicionais?",
    description:
      "Um olhar sobre as comunidades tradicionais de matriz africana e de terreiro no Brasil.",
    image: artigoComunidades,
  },
  {
    slug: "linguas-do-candomble",
    kicker: "As linguagens do Candomblé",
    title: "Quais as linguagens do Candomblé?",
    description:
      "As línguas africanas nas religiões de matriz africana no Brasil.",
    image: artigoLinguas,
  },
  {
    slug: "nacoes-do-candomble",
    kicker: "As nações do Candomblé no Brasil",
    title: "Quais as nações do Candomblé no Brasil?",
    description: "Origens, divindades e práticas religiosas das nações do Candomblé.",
    image: artigoNacoes,
  },
];

const NATION_KEYS: Record<string, string> = {
  umbanda: "umbanda",
  nagô: "nago",
  nago: "nago",
  ketu: "ketu",
  "ekiti efon": "ekiti-efon",
  jeje: "jeje",
  angola: "angola",
  quimbanda: "quimbanda",
};

const nationKey = (nation: string): string =>
  NATION_KEYS[nation.trim().toLowerCase()] ?? "outros";

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("pt-BR").format(value);

export function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    Promise.all([
      communitiesApi.statsSummary(),
      communitiesApi.statsByPhotoCoverage(),
      communitiesApi.statsByNation(),
      communitiesApi.oldest(),
    ])
      .then(([summary, photoCoverage, nations, oldest]) => {
        if (!active) return;
        setData({ summary, photoCoverage, nations, oldest });
      })
      .catch(() => {
        if (active) {
          setError("Não foi possível carregar os números do recenseamento.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const summary = data?.summary;
  const photoCoverage = data?.photoCoverage;
  const nations = data?.nations ?? [];
  const oldest = (data?.oldest ?? []).slice(0, 9);
  const total = summary?.totalReligiousCommunities ?? 0;
  const neighborhoods = summary?.totalNeighborhoods ?? 0;
  const cities = summary?.totalCities ?? 0;
  const withPhoto = photoCoverage?.withPhoto ?? 0;

  const counters = [
    {
      label: "terreiros recenseados",
      value: summary ? formatNumber(summary.totalReligiousCommunities) : "—",
    },
    {
      label: "com fotografia no acervo",
      value: photoCoverage ? formatNumber(photoCoverage.withPhoto) : "—",
    },
    {
      label: "bairros percorridos",
      value: summary ? formatNumber(summary.totalNeighborhoods) : "—",
    },
    {
      label: "cidades recenseadas",
      value: summary ? formatNumber(summary.totalCities) : "—",
    },
  ];

  const nationMax = nations.reduce(
    (highest, item) => Math.max(highest, item.count),
    0,
  );

  const orderedNations = [...nations].sort(
    (a, b) => b.count - a.count || a.nation.localeCompare(b.nation, "pt-BR"),
  );

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero__img"
          src={heroImg}
          alt=""
          width={1800}
          height={1197}
        />
        <div className="shell hero__body">
          <p className="hero__eyebrow">
            Recenseamento · Região Metropolitana de João Pessoa
          </p>
          <h1 className="display-1" id="hero-title">
            Cadastramento dos Terreiros de Matriz Africana
          </h1>
          <p className="hero__lede">
            Um projeto para fortalecer as comunidades de matriz africana,
            promover a igualdade e preservar um patrimônio cultural imaterial
            brasileiro.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/buscar">
              Buscar um terreiro <ArrowIcon />
            </Link>
            <Link className="btn btn--onDeep" to="/sobre-o-projeto">
              Sobre o projeto
            </Link>
          </div>
          <div className="hero__meta">
            <span>Casa de Cultura Ilê Asé D&apos;Osoguian</span>
            <span>FUNJOPE/PB</span>
            <span>PNUD</span>
          </div>
        </div>
      </section>

      <section
        className="stats"
        aria-label="Números do recenseamento"
        aria-busy={loading}
      >
        <div className="shell stats__grid">
          {counters.map((counter) => (
            <div className="stat od-stat" key={counter.label}>
              <div className="stat__bar" aria-hidden="true" />
              <div className="stat__num">{counter.value}</div>
              <div className="stat__label">{counter.label}</div>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <div className="shell mt-6">
          <div className="empty" role="alert">
            <h3>Erro ao carregar o recenseamento</h3>
            <p>{error}</p>
            <div className="empty__actions">
              <Button onClick={() => setAttempt((current) => current + 1)}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="section" aria-labelledby="acervo-title">
        <div className="shell">
          <div className="shead">
            <div className="shead__text">
              <p className="eyebrow">Acervo</p>
              <h2 className="display-2" id="acervo-title">
                Conheça alguns dos terreiros
              </h2>
              <p className="lede">
                {summary
                  ? `Uma seleção entre as ${formatNumber(total)} comunidades recenseadas: os nove terreiros mais antigos do acervo.`
                  : "Uma seleção dos nove terreiros mais antigos do acervo."}
              </p>
            </div>
            <Link className="btn btn--ghost shead__link" to="/buscar">
              Ver todos <ArrowIcon />
            </Link>
          </div>

          {loading ? (
            <p className="muted" role="status" aria-live="polite">
              Carregando os terreiros mais antigos…
            </p>
          ) : error ? (
            <p className="muted">
              Não foi possível carregar os terreiros mais antigos.
            </p>
          ) : oldest.length === 0 ? (
            <EmptyState
              title="Nenhum terreiro no acervo"
              description="Ainda não há comunidades com censo aprovado para exibir."
            />
          ) : (
            <div className="cardgrid">
              {oldest.map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onClick={(item) => navigate(`/terreiro/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="numeros-title">
        <div className="shell home-numbers">
          <div>
            <p className="eyebrow">Mapeamento em números</p>
            <h2 className="display-2" id="numeros-title">
              Quantos somos? Onde estamos?
            </h2>
            <p className="lede">
              {summary
                ? `As ${formatNumber(total)} comunidades se distribuem por ${formatNumber(
                    neighborhoods,
                  )} bairros e ${formatNumber(cities)} cidades da Região Metropolitana de João Pessoa. A nação é lida como dado do censo, não como decoração.`
                : "As comunidades do censo se distribuem pelos bairros e cidades da Região Metropolitana de João Pessoa. A nação é lida como dado do censo, não como decoração."}
            </p>
            {photoCoverage ? (
              <p className="meta mt-6">
                {formatNumber(withPhoto)} registros com fotografia no acervo
              </p>
            ) : null}
            <p className="mt-6">
              <Link className="pill-link" to="/mapeamento">
                Explorar o mapeamento <ArrowIcon />
              </Link>
            </p>
          </div>

          <div>
            {loading ? (
              <p className="muted" role="status" aria-live="polite">
                Carregando os números por nação…
              </p>
            ) : error ? (
              <p className="chart-note">
                Não foi possível carregar os números por nação.
              </p>
            ) : orderedNations.length === 0 ? (
              <p className="chart-note">Sem dados por nação no momento.</p>
            ) : (
              <div className="bars">
                {orderedNations.map((item) => (
                  <div key={item.nation}>
                    <div className="bar__top">
                      <span className="bar__label">
                        <span
                          className="nation-dot"
                          style={
                            {
                              "--dot": `var(--n-${nationKey(item.nation)}, var(--map-dot))`,
                            } as CSSProperties
                          }
                          aria-hidden="true"
                        />{" "}
                        {item.nation}
                      </span>
                      <span className="bar__value">{formatNumber(item.count)}</span>
                    </div>
                    <div className="bar__track">
                      <div
                        className="bar__fill"
                        style={{
                          width:
                            nationMax > 0
                              ? `${Math.max(2, (item.count / nationMax) * 100)}%`
                              : "0%",
                          background: "var(--accent-deep)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="territorio-title">
        <div className="shell">
          <div className="shead">
            <div className="shead__text">
              <p className="eyebrow">Território</p>
              <h2 className="display-2" id="territorio-title">
                Onde estão os terreiros
              </h2>
              <p className="lede">
                Cada terreiro recenseado tem endereço e coordenadas registrados
                no censo. O mapa reúne as comunidades por cidade, bairro e nação
                — uma leitura do território a partir dos dados, não de
                estimativas.
              </p>
            </div>
            <Link className="btn btn--ghost shead__link" to="/mapeamento">
              Abrir o mapa <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>

      <section
        className="section section--deep"
        aria-labelledby="projeto-title"
      >
        <div className="shell">
          <p className="eyebrow">O que move o projeto</p>
          <h2 className="display-2" id="projeto-title">
            Visibilidade, memória e direito
          </h2>
          <p className="lede">
            O cadastramento nasce do reconhecimento de que esses espaços são
            patrimônio vivo — e de que a informação qualificada é uma forma de
            proteção.
          </p>
          <div className="manifesto mt-7">
            <div>
              <h3>Visibilidade</h3>
              <p>
                Identificar e localizar os terreiros, promovendo o
                reconhecimento formal de sua existência e atuação.
              </p>
            </div>
            <div>
              <h3>Memória</h3>
              <p>
                Preservar saberes, línguas e práticas das comunidades de matriz
                africana como patrimônio cultural imaterial.
              </p>
            </div>
            <div>
              <h3>Direito</h3>
              <p>
                Subsidiar políticas públicas e combater a intolerância
                religiosa e o racismo institucional.
              </p>
            </div>
          </div>
          <div className="hero__actions mt-7">
            <Link className="btn btn--light" to="/cadastro-voluntario">
              Cadastrar um terreiro <ArrowIcon />
            </Link>
            <Link className="btn btn--onDeep" to="/sobre-o-projeto">
              Ler a história do projeto
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="artigos-title">
        <div className="shell">
          <div className="shead">
            <div className="shead__text">
              <p className="eyebrow">Artigos</p>
              <h2 className="display-2" id="artigos-title">
                Uma luta contra a exclusão e a intolerância religiosa
              </h2>
              <p className="lede">
                Leia os artigos para entender mais sobre as comunidades
                tradicionais, as línguas rituais e as nações do Candomblé no
                Brasil.
              </p>
            </div>
            <Link className="btn btn--ghost shead__link" to="/artigos">
              Ver todos os artigos <ArrowIcon />
            </Link>
          </div>
          <div className="home-articles">
            {ARTICLES.map((article) => (
              <ArticleCard key={article.slug} {...article} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
