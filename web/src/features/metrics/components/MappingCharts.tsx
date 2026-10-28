import { useMemo } from "react";
import MetricBarChart from "./MetricBarChart";
import type { BarChartDatum } from "./MetricBarChart";
import type { ReligiousCommunity } from "../../../domain/types";

export interface MappingChartsProps {
  /** Lista já filtrada pela página; toda agregação é derivada no cliente. */
  communities: ReligiousCommunity[];
}

const DECADES = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
const TOP_NEIGHBORHOODS = 10;
const CURRENT_YEAR = new Date().getFullYear();
const NOT_INFORMED = "Não informado";

const cap = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

/** Extrai bairro e cidade tolerando o DTO achatado (apenas `fullAddress`). */
function communityPlace(community: ReligiousCommunity): {
  neighborhood: string;
  city: string;
} {
  const address = community.communityAddress;
  const neighborhood = (address?.neighborhood ?? community.neighborhood ?? "").trim();
  const city = (address?.city ?? community.city ?? "").trim();
  if (neighborhood || city) return { neighborhood, city };

  const parts = (community.fullAddress ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    neighborhood: parts.length >= 2 ? parts[0] : "",
    city: parts.length >= 2 ? parts[1] : (parts[0] ?? ""),
  };
}

const validYear = (year: number | undefined | null): year is number =>
  typeof year === "number" &&
  Number.isFinite(year) &&
  year >= 1900 &&
  year <= CURRENT_YEAR;

/** Conta ocorrências de uma chave e devolve a série ordenada (maior primeiro). */
function toSeries(
  list: ReligiousCommunity[],
  pick: (community: ReligiousCommunity) => string,
): BarChartDatum[] {
  const counts = new Map<string, number>();
  list.forEach((community) => {
    const key = pick(community) || NOT_INFORMED;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort(
      (a, b) =>
        b.value - a.value || a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" }),
    );
}

interface TypeByNationDatum {
  nation: string;
  african: number;
  traditional: number;
  total: number;
}

interface DecadeDatum {
  decade: number;
  count: number;
}

/**
 * Os quatro gráficos do mapeamento do protótipo — por nação, por cidade,
 * década de fundação (histograma) e tipo por nação (barras empilhadas) —
 * mais os seis indicadores complementares. Tudo é derivado da lista
 * recebida, de modo que os filtros da página valem para todos os gráficos.
 */
export function MappingCharts({ communities }: MappingChartsProps) {
  const byNation = useMemo(
    () => toSeries(communities, (community) => cap(community.religiousSpaceNation ?? "")),
    [communities],
  );

  const byCity = useMemo(
    () => toSeries(communities, (community) => communityPlace(community).city),
    [communities],
  );

  const byDecade = useMemo<DecadeDatum[]>(() => {
    const counts = new Map<number, number>(DECADES.map((decade) => [decade, 0]));
    communities.forEach((community) => {
      if (!validYear(community.religiousSpaceYearFoundation)) return;
      const decade = Math.floor(community.religiousSpaceYearFoundation / 10) * 10;
      counts.set(decade, (counts.get(decade) ?? 0) + 1);
    });
    return [...counts.entries()]
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade - b.decade);
  }, [communities]);

  const withYear = useMemo(
    () => communities.filter((community) => validYear(community.religiousSpaceYearFoundation)).length,
    [communities],
  );

  const typeByNation = useMemo<TypeByNationDatum[]>(() => {
    const groups = new Map<string, { african: number; traditional: number }>();
    communities.forEach((community) => {
      const nation = cap(community.religiousSpaceNation ?? "") || NOT_INFORMED;
      const entry = groups.get(nation) ?? { african: 0, traditional: 0 };
      if (community.communityType === "matriz africana") {
        entry.african += 1;
      } else {
        entry.traditional += 1;
      }
      groups.set(nation, entry);
    });
    return [...groups.entries()]
      .map(([nation, entry]) => ({
        nation,
        african: entry.african,
        traditional: entry.traditional,
        total: entry.african + entry.traditional,
      }))
      .sort(
        (a, b) =>
          b.total - a.total || a.nation.localeCompare(b.nation, "pt-BR", { sensitivity: "base" }),
      );
  }, [communities]);

  const byType = useMemo(
    () => toSeries(communities, (community) => cap(community.communityType ?? "")),
    [communities],
  );

  const byLeaderGender = useMemo(
    () => toSeries(communities, (community) => cap(community.leaderGender ?? "")),
    [communities],
  );

  const byLeaderEthnicity = useMemo(
    () => toSeries(communities, (community) => community.leaderEthnicity ?? ""),
    [communities],
  );

  const byLanguage = useMemo(
    () => toSeries(communities, (community) => cap(community.religiousSpacePraticalLanguages ?? "")),
    [communities],
  );

  const byNeighborhood = useMemo(
    () => toSeries(communities, (community) => communityPlace(community).neighborhood).slice(0, TOP_NEIGHBORHOODS),
    [communities],
  );

  const photoCoverage = useMemo(() => {
    const withPhoto = communities.filter((community) => Boolean(community.religiousSpaceMainPicture)).length;
    return { withPhoto, withoutPhoto: communities.length - withPhoto, total: communities.length };
  }, [communities]);

  const decadeMax = byDecade.reduce((highest, item) => Math.max(highest, item.count), 0);

  return (
    <div className="chart-grid">
      <MetricBarChart
        title="Por nação"
        data={byNation}
        note="Distribuição dos registros filtrados entre as nações do censo."
      />
      <MetricBarChart
        title="Por cidade"
        data={byCity}
        note="Cidades da Região Metropolitana de João Pessoa."
      />

      <article className="chart-card card card--pad chart-card--wide" data-testid="chart-card">
        <h2>Década de fundação</h2>
        {communities.length === 0 ? (
          <p className="chart-note">Sem dados</p>
        ) : (
          <>
            <div className="histo">
              {byDecade.map((item) => {
                const height = decadeMax > 0 ? (item.count / decadeMax) * 100 : 0;
                return (
                  <div className="histo__col" key={item.decade}>
                    <span className="histo__n">{item.count}</span>
                    <div className="histo__track">
                      <div
                        className="histo__fill"
                        data-testid="histo-bar"
                        style={{
                          height: `${item.count ? Math.max(3, height) : 0}%`,
                          minHeight: item.count ? undefined : 0,
                        }}
                      />
                    </div>
                    <span className="histo__label">{item.decade}</span>
                  </div>
                );
              })}
            </div>
            <p className="chart-note">
              {withYear} registros com ano de fundação informado. Onde o dado não existe, a
              interface não estima.
            </p>
          </>
        )}
      </article>

      <article className="chart-card card card--pad chart-card--wide" data-testid="chart-card">
        <h2>Tipo por nação</h2>
        {typeByNation.length === 0 ? (
          <p className="chart-note">Sem dados</p>
        ) : (
          <div className="stackbar">
            {typeByNation.map((item) => (
              <div className="stackbar__row" key={item.nation}>
                <span className="stackbar__name">{item.nation}</span>
                <div className="stackbar__track">
                  {item.african ? (
                    <div
                      className="stackbar__seg stackbar__seg--african"
                      style={{ width: `${(item.african / item.total) * 100}%` }}
                      title={`${item.african} de matriz africana`}
                    >
                      {item.african}
                    </div>
                  ) : null}
                  {item.traditional ? (
                    <div
                      className="stackbar__seg stackbar__seg--traditional"
                      style={{ width: `${(item.traditional / item.total) * 100}%` }}
                      title={`${item.traditional} comunidade de terreiro`}
                    >
                      {item.traditional}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="stackbar__legend">
          <span className="stackbar__key">
            <span className="stackbar__swatch" style={{ background: "var(--accent)" }} />
            Matriz africana
          </span>
          <span className="stackbar__key">
            <span className="stackbar__swatch" style={{ background: "var(--accent-deep)" }} />
            Comunidade de terreiro
          </span>
        </div>
        <p className="chart-note">
          Cada segmento traz o próprio número: a cor não é o único canal de leitura.
        </p>
      </article>

      <MetricBarChart
        title="Comunidades por tipo"
        data={byType}
      />
      <MetricBarChart
        title="Lideranças por gênero"
        data={byLeaderGender}
      />
      <MetricBarChart
        title="Lideranças por etnia"
        data={byLeaderEthnicity}
      />
      <MetricBarChart
        title="Comunidades por idioma ritual"
        data={byLanguage}
      />
      <MetricBarChart
        title="Comunidades por bairro (top 10)"
        data={byNeighborhood}
      />
      <MetricBarChart
        title="Cobertura fotográfica"
        data={[
          { label: "Com foto", value: photoCoverage.withPhoto },
          { label: "Sem foto", value: photoCoverage.withoutPhoto },
        ]}
        note={`Total de comunidades: ${photoCoverage.total}`}
      />
    </div>
  );
}

export default MappingCharts;
