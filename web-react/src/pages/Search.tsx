import { useEffect, useState } from "react";
import { communitiesApi } from "../api/communities";
import SearchFilters, { type SearchFiltersValue } from "../features/communities/components/SearchFilters";
import CommunityCard from "../features/communities/components/CommunityCard";
import type { ReligiousCommunity } from "../domain/types";

const PAGE_SIZE = 9;

export function Search() {
  const [filters, setFilters] = useState<SearchFiltersValue>({});
  const [results, setResults] = useState<ReligiousCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [all, setAll] = useState<ReligiousCommunity[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    communitiesApi
      .list()
      .then((data) => {
        if (active) setAll(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const term = (filters.query ?? "").toLowerCase().trim();
    const filtered = all.filter((c) => {
      const matchesTerm =
        !term ||
        c.religiousSpaceName?.toLowerCase().includes(term) ||
        c.communityAddress?.neighborhood?.toLowerCase().includes(term) ||
        c.communityAddress?.city?.toLowerCase().includes(term) ||
        c.religiousSpaceNation?.toLowerCase().includes(term);
      const matchesNation = !filters.nation || c.religiousSpaceNation === filters.nation;
      const matchesCity = !filters.city || c.communityAddress?.city === filters.city;
      const matchesType = !filters.type || c.communityType === filters.type;
      return matchesTerm && matchesNation && matchesCity && matchesType;
    });
    setResults(filtered);
  }, [all, filters]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = results.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <main className="shell">
      <section className="page-body">
        <SearchFilters value={filters} onChange={(next) => { setFilters(next); setPage(1); }} />
        <div className="results-head">
          <h2>Resultados</h2>
          <span>{results.length} encontrados</span>
        </div>
        <div className="cardgrid">
          {loading ? (
            <p>Carregando…</p>
          ) : pageItems.length === 0 ? (
            <p>Nenhum resultado.</p>
          ) : (
            pageItems.map((c) => <CommunityCard key={c.id} community={c} />)
          )}
        </div>
        <nav className="pagination" aria-label="Paginação">
          <button type="button" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Anterior
          </button>
          <span>{safePage} / {totalPages}</span>
          <button type="button" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Próxima
          </button>
        </nav>
      </section>
    </main>
  );
}

export default Search;
