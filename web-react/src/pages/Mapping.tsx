import { useEffect, useMemo, useState } from "react";
import { communitiesApi } from "../api/communities";
import Button from "../components/ui/Button";
import EmptyState from "../components/composed/EmptyState";
import SearchFilters from "../features/communities/components/SearchFilters";
import type { SearchFiltersValue } from "../features/communities/components/SearchFilters";
import MappingCharts from "../features/metrics/components/MappingCharts";
import LeafletMap from "../features/metrics/components/LazyLeafletMap";
import type { ReligiousCommunity } from "../domain/types";
import { trackFilterApply } from "../features/analytics/events";

/** Extrai bairro e cidade, tolerando o DTO achatado (apenas `fullAddress`). */
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

const hasCoordinates = (community: ReligiousCommunity): boolean =>
  typeof community.lat === "number" &&
  typeof community.long === "number" &&
  Number.isFinite(community.lat) &&
  Number.isFinite(community.long);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("pt-BR").format(value);

const normalize = (value: string | undefined | null): string =>
  (value ?? "").trim().toLowerCase();

const distinct = (values: string[]): string[] =>
  [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" }),
  );

/**
 * Mapeamento do censo: filtros locais sobre a lista pública e todos os
 * indicadores derivados no cliente, para que mapa, resumo, legenda e
 * gráficos respondam ao mesmo recorte.
 */
export function Mapping() {
  const [all, setAll] = useState<ReligiousCommunity[]>([]);
  const [filters, setFilters] = useState<SearchFiltersValue>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    communitiesApi
      .list()
      .then((list) => {
        if (active) setAll(list);
      })
      .catch(() => {
        if (active) setError("Não foi possível carregar os dados do mapeamento.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const nations = useMemo(
    () => distinct(all.map((community) => community.religiousSpaceNation ?? "")),
    [all],
  );
  const cities = useMemo(
    () => distinct(all.map((community) => communityPlace(community).city)),
    [all],
  );
  const types = useMemo(
    () => distinct(all.map((community) => community.communityType ?? "")),
    [all],
  );

  const filtered = useMemo(() => {
    const term = normalize(filters.query);
    return all.filter((community) => {
      const place = communityPlace(community);
      const matchesTerm =
        !term ||
        normalize(community.religiousSpaceName).includes(term) ||
        normalize(place.neighborhood).includes(term) ||
        normalize(place.city).includes(term) ||
        normalize(community.religiousSpaceNation).includes(term);
      const matchesNation = !filters.nation || normalize(community.religiousSpaceNation) === normalize(filters.nation);
      const matchesCity = !filters.city || normalize(place.city) === normalize(filters.city);
      const matchesType = !filters.type || normalize(community.communityType) === normalize(filters.type);
      return matchesTerm && matchesNation && matchesCity && matchesType;
    });
  }, [all, filters]);

  const summary = useMemo(() => {
    const citySet = new Set<string>();
    const neighborhoodSet = new Set<string>();
    filtered.forEach((community) => {
      const place = communityPlace(community);
      if (place.city) citySet.add(place.city);
      if (place.neighborhood) neighborhoodSet.add(place.neighborhood);
    });
    return { cities: citySet.size, neighborhoods: neighborhoodSet.size };
  }, [filtered]);

  const mapped = useMemo(() => filtered.filter(hasCoordinates), [filtered]);

  const hasFilters =
    Boolean(filters.query?.trim()) ||
    Boolean(filters.nation) ||
    Boolean(filters.city) ||
    Boolean(filters.type);

  const empty = !loading && !error && all.length === 0;

  return (
    <main>
      <div className="page-head">
        <div className="shell">
          <p className="eyebrow">Território e censo</p>
          <h1 className="display-1">Mapeamento</h1>
          <p className="lede">
            Uma leitura do recenseamento por território, nação, tipo e década de fundação. Os
            pontos usam as coordenadas registradas no censo.
          </p>
        </div>
      </div>

      <div className="shell page-body">
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

        {!loading && !error && !empty ? (
          <>
            <div className="mapping-filters">
              <SearchFilters
                value={filters}
                nations={nations}
                cities={cities}
                types={types}
                onChange={(next) => {
                  setFilters(next);
                  trackFilterApply({
                    nation: next.nation,
                    city: next.city,
                    type: next.type,
                    hasQuery: Boolean(next.query?.trim()),
                  });
                }}
              />
              {hasFilters ? (
                <div className="filterbar__actions">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      setFilters({});
                      trackFilterApply({ cleared: true });
                    }}
                  >
                    Limpar
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mapping-summary">
              <p className="results-head__count" aria-live="polite">
                {filtered.length === 1
                  ? "1 terreiro"
                  : `${formatNumber(filtered.length)} terreiros`}
              </p>
              <p className="meta">
                {formatNumber(summary.cities)} cidades ·{" "}
                {formatNumber(summary.neighborhoods)} bairros ·{" "}
                {hasFilters ? "filtros ativos" : "acervo completo"}
              </p>
            </div>

            {mapped.length ? (
              <LeafletMap
                communities={filtered}
                className="mapbox mapping-map"
                height={460}
              />
            ) : (
              <p className="map-empty">Nenhum terreiro com os filtros atuais.</p>
            )}


            <MappingCharts communities={filtered} />
          </>
        ) : null}
      </div>
    </main>
  );
}

export default Mapping;
