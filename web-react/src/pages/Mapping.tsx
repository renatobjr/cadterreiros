import { useEffect, useState } from "react";
import { communitiesApi } from "../api/communities";
import Button from "../components/ui/Button";
import EmptyState from "../components/composed/EmptyState";
import MappingCharts from "../features/metrics/components/MappingCharts";
import CommunityMap from "../features/metrics/components/CommunityMap";
import type { MappingStats, ReligiousCommunity } from "../domain/types";

const EMPTY_STATS: MappingStats = {
  summary: {
    totalReligiousCommunities: 0,
    totalCities: 0,
    totalNeighborhoods: 0,
  },
  byNation: [],
  byCity: [],
  byDecade: [],
  byTypeAndNation: [],
  byType: [],
  byLeaderGender: [],
  byLeaderEthnicity: [],
  byLanguage: [],
  byNeighborhood: [],
  byPhotoCoverage: { withPhoto: 0, withoutPhoto: 0, total: 0 },
};

const hasNoData = (stats: MappingStats): boolean =>
  stats.summary.totalReligiousCommunities === 0 &&
  stats.byNation.length === 0 &&
  stats.byCity.length === 0 &&
  stats.byDecade.length === 0 &&
  stats.byTypeAndNation.length === 0 &&
  stats.byType.length === 0 &&
  stats.byLeaderGender.length === 0 &&
  stats.byLeaderEthnicity.length === 0 &&
  stats.byLanguage.length === 0 &&
  stats.byNeighborhood.length === 0 &&
  stats.byPhotoCoverage.total === 0;

export function Mapping() {
  const [stats, setStats] = useState<MappingStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [communities, setCommunities] = useState<ReligiousCommunity[]>([]);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    Promise.all([
      communitiesApi.list(),
      communitiesApi.statsSummary(),
      communitiesApi.statsByNation(),
      communitiesApi.statsByCity(),
      communitiesApi.statsByDecade(),
      communitiesApi.statsByTypeAndNation(),
      communitiesApi.statsByType(),
      communitiesApi.statsByLeaderGender(),
      communitiesApi.statsByLeaderEthnicity(),
      communitiesApi.statsByLanguage(),
      communitiesApi.statsByNeighborhood(),
      communitiesApi.statsByPhotoCoverage(),
    ])
      .then(
        ([
          list,
          summary,
          byNation,
          byCity,
          byDecade,
          byTypeAndNation,
          byType,
          byLeaderGender,
          byLeaderEthnicity,
          byLanguage,
          byNeighborhood,
          byPhotoCoverage,
        ]) => {
          if (!active) return;
          setCommunities(list);
          setStats({
            summary,
            byNation,
            byCity,
            byDecade,
            byTypeAndNation,
            byType,
            byLeaderGender,
            byLeaderEthnicity,
            byLanguage,
            byNeighborhood,
            byPhotoCoverage,
          });
        },
      )
      .catch(() => {
        if (active) {
          setError("Não foi possível carregar os dados do mapeamento.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const empty = !loading && !error && hasNoData(stats);

  return (
    <main className="mapping">
      <div className="mapping-summary">
        <h1>Mapeamento</h1>
        {!loading && !error && !empty ? (
          <p className="muted" aria-live="polite">
            {stats.summary.totalReligiousCommunities} terreiros ·{" "}
            {stats.summary.totalCities} cidades ·{" "}
            {stats.summary.totalNeighborhoods} bairros
          </p>
        ) : null}
      </div>

      {!loading && !error && !empty ? (
        <CommunityMap communities={communities} />
      ) : null}

      {loading ? (
        <p className="muted" role="status" aria-live="polite">
          Carregando dados do mapeamento…
        </p>
      ) : null}

      {error ? (
        <div className="empty" role="alert">
          <h3>Erro ao carregar o mapeamento</h3>
          <p>{error}</p>
          <div className="empty__actions">
            <Button onClick={() => setAttempt((current) => current + 1)}>
              Tentar novamente
            </Button>
          </div>
        </div>
      ) : null}

      {empty ? (
        <EmptyState
          page
          title="Nenhum terreiro aprovado"
          description="Ainda não há comunidades com censo aprovado para exibir no mapeamento."
        />
      ) : null}

      {!loading && !error && !empty ? <MappingCharts stats={stats} /> : null}
    </main>
  );
}

export default Mapping;
