import MetricBarChart from "./MetricBarChart";
import type { BarChartDatum } from "./MetricBarChart";
import type { MappingStats } from "../../../domain/types";

export interface MappingChartsProps {
  stats: MappingStats;
}

const cap = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const toSeries = <T,>(
  rows: T[],
  labelOf: (row: T) => string,
  valueOf: (row: T) => number,
): BarChartDatum[] => rows.map((row) => ({ label: labelOf(row), value: valueOf(row) }));

/** Os dez gráficos agregados do mapeamento, alimentados pela API pública. */
export function MappingCharts({ stats }: MappingChartsProps) {
  const typeAndNation = stats.byTypeAndNation.flatMap((row) => [
    { label: `${cap(row.nation)} — matriz africana`, value: row.african },
    { label: `${cap(row.nation)} — comunidade de terreiro`, value: row.traditional },
  ]);

  return (
    <div className="chart-grid">
      <MetricBarChart
        title="Comunidades por nação"
        data={toSeries(stats.byNation, (row) => cap(row.nation), (row) => row.count)}
      />
      <MetricBarChart
        title="Comunidades por cidade"
        data={toSeries(stats.byCity, (row) => row.city, (row) => row.count)}
      />
      <MetricBarChart
        title="Comunidades por década de fundação"
        data={toSeries(stats.byDecade, (row) => row.decade, (row) => row.count)}
      />
      <MetricBarChart title="Comunidades por tipo e nação" data={typeAndNation} />
      <MetricBarChart
        title="Comunidades por tipo"
        data={toSeries(stats.byType, (row) => cap(row.type), (row) => row.count)}
      />
      <MetricBarChart
        title="Lideranças por gênero"
        data={toSeries(stats.byLeaderGender, (row) => cap(row.gender), (row) => row.count)}
      />
      <MetricBarChart
        title="Lideranças por etnia"
        data={toSeries(
          stats.byLeaderEthnicity,
          (row) => row.ethnicity,
          (row) => row.count,
        )}
      />
      <MetricBarChart
        title="Comunidades por idioma ritual"
        data={toSeries(
          stats.byLanguage,
          (row) => row.language,
          (row) => row.count,
        )}
      />
      <MetricBarChart
        title="Comunidades por bairro (top 10)"
        data={toSeries(
          stats.byNeighborhood,
          (row) => row.neighborhood,
          (row) => row.count,
        )}
      />
      <MetricBarChart
        title="Cobertura fotográfica"
        data={[
          { label: "Com foto", value: stats.byPhotoCoverage.withPhoto },
          { label: "Sem foto", value: stats.byPhotoCoverage.withoutPhoto },
        ]}
        note={`Total de comunidades: ${stats.byPhotoCoverage.total}`}
      />
    </div>
  );
}

export default MappingCharts;
