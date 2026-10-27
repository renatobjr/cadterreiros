import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { communitiesApi } from "../api/communities";
import SearchFilters, { type SearchFiltersValue } from "../features/communities/components/SearchFilters";
import CommunityCard from "../features/communities/components/CommunityCard";
import type { CommunityAddress, ReligiousCommunity } from "../domain/types";
import Select from "../components/ui/Select";

/** Extrai bairro e cidade, tolerando o DTO achatado (apenas `fullAddress`). */
function communityPlace(community: ReligiousCommunity): {
  neighborhood: string;
  city: string;
  label: string;
} {
  const address = community.communityAddress;
  const neighborhood = address?.neighborhood ?? community.neighborhood ?? "";
  const city = address?.city ?? community.city ?? "";
  if (!neighborhood && !city) {
    const parts = (community.fullAddress ?? "")
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const n = parts.length >= 2 ? parts[0] : "";
    const c = parts.length >= 2 ? parts[1] : parts[0] ?? "";
    return { neighborhood: n, city: c, label: [n, c].filter(Boolean).join(", ") };
  }
  return { neighborhood, city, label: [neighborhood, city].filter(Boolean).join(", ") };
}

const PAGE_SIZE = 12;

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "name-asc", label: "Nome (A–Z)" },
  { value: "nation-asc", label: "Nação" },
  { value: "founded-asc", label: "Ano" },
];

type SortKey = "name-asc" | "nation-asc" | "founded-asc";

function compareName(a: ReligiousCommunity, b: ReligiousCommunity): number {
  const na = a.religiousSpaceName ?? "";
  const nb = b.religiousSpaceName ?? "";
  return na.localeCompare(nb, "pt-BR", { sensitivity: "base" });
}

function sortCommunities(list: ReligiousCommunity[], sort: SortKey): ReligiousCommunity[] {
  const copy = list.slice();
  if (sort === "nation-asc") {
    copy.sort(
      (a, b) =>
        (a.religiousSpaceNation ?? "").localeCompare(b.religiousSpaceNation ?? "", "pt-BR", {
          sensitivity: "base",
        }) || compareName(a, b),
    );
  } else if (sort === "founded-asc") {
    copy.sort(
      (a, b) =>
        (a.religiousSpaceYearFoundation ?? 9999) - (b.religiousSpaceYearFoundation ?? 9999) ||
        compareName(a, b),
    );
  } else {
    copy.sort(compareName);
  }
  return copy;
}

/** Janela de até 5 páginas numeradas centrada na página atual. */
function pageWindow(page: number, pages: number): number[] {
  let start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  start = Math.max(1, end - 4);
  const out: number[] = [];
  for (let i = start; i <= end; i += 1) out.push(i);
  return out;
}

export function Search() {
  const [filters, setFilters] = useState<SearchFiltersValue>({});
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<ReligiousCommunity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [view, setView] = useState<"grid" | "table">("grid");

  const capitalize = (value: string): string =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  const nations = useMemo(() => [...new Set(all.map((c) => c.religiousSpaceNation).filter(Boolean) as string[])].sort(), [all]);
  const cities = useMemo(() => [...new Set(all.map((c) => (c.communityAddress?.city ?? c.city ?? "").trim()).filter(Boolean))].sort(), [all]);
  const types = useMemo(() => [...new Set(all.map((c) => c.communityType).filter(Boolean) as string[])].sort(), [all]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([communitiesApi.list(), communitiesApi.statsSummary()])
      .then(([list, summary]) => {
        if (!active) return;
        setAll(list);
        setTotal(summary.totalReligiousCommunities || list.length);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = (filters.query ?? "").toLowerCase().trim();
    return all.filter((c) => {
      const address: Partial<CommunityAddress> | undefined = c.communityAddress;
      const place = communityPlace(c);
      const matchesTerm =
        !term ||
        c.religiousSpaceName?.toLowerCase().includes(term) ||
        address?.neighborhood?.toLowerCase().includes(term) ||
        place.neighborhood.toLowerCase().includes(term) ||
        place.city.toLowerCase().includes(term) ||
        c.religiousSpaceNation?.toLowerCase().includes(term);
      const matchesNation = !filters.nation || c.religiousSpaceNation === filters.nation;
      const matchesCity = !filters.city || place.city === filters.city || address?.city === filters.city;
      const matchesType = !filters.type || c.communityType === filters.type;
      return matchesTerm && matchesNation && matchesCity && matchesType;
    });
  }, [all, filters]);

  const sorted = useMemo(() => sortCommunities(filtered, sort), [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = sorted.length ? (safePage - 1) * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, sorted.length);
  const hasFilters =
    Boolean(filters.query?.trim()) || Boolean(filters.nation) || Boolean(filters.city) || Boolean(filters.type);

  return (
    <>
      <section className="page-head">
        <div className="shell">
          <p className="eyebrow">Acervo público</p>
          <h1 className="display-1">Buscar um terreiro</h1>
          <p className="lede">
            Pesquise por nome, bairro ou cidade e combine com nação, cidade e tipo de comunidade. Os{" "}
            {total} registros do censo estão disponíveis.
          </p>
        </div>
      </section>
      <div className="shell page-body">
        <SearchFilters value={filters} nations={nations} cities={cities} types={types} onChange={(next) => { setFilters(next); setPage(1); }} />

        <h2 className="skip-vis">Resultados da busca</h2>
        <div className="results-head">
          <div className="results-head__main">
            <p className="results-head__count" aria-live="polite">
              {filtered.length === 1 ? "1 terreiro encontrado" : `${filtered.length} terreiros encontrados`}
            </p>
            <p className="meta results-head__sub">
              {filtered.length
                ? `Mostrando ${rangeStart}–${rangeEnd} de ${filtered.length}`
                : "Ajuste a busca ou limpe os filtros."}
            </p>
          </div>
          <div className="results-tools">
            <div className="field sortfield">
              <label htmlFor="sort">Ordenar por</label>
              <Select
                id="sort"
                value={sort}
                onChange={(value) => {
                  setSort(value as SortKey);
                  setPage(1);
                }}
                options={SORT_OPTIONS}
                placeholder="Ordenar por"
              />
            </div>
            <div className="viewtoggle" role="group" aria-label="Formato dos resultados">
              <button type="button" data-view="grid" aria-pressed={view === "grid"} onClick={() => setView("grid")}>
                Grade
              </button>
              <button type="button" data-view="table" aria-pressed={view === "table"} onClick={() => setView("table")}>
                Tabela
              </button>
            </div>
            <Link className="btn btn--quiet" to="/mapeamento">
              Ver no mapa
            </Link>
            {hasFilters ? (
              <button
                type="button"
                className="btn btn--quiet"
                onClick={() => {
                  setFilters({});
                  setPage(1);
                }}
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        </div>

        <div id="results-body">
          {loading ? (
            <p>Carregando…</p>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <p className="eyebrow">Nenhum resultado</p>
              <p>Não encontramos terreiros com esses filtros. Tente outro nome, bairro ou nação.</p>
              <div className="empty__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setFilters({});
                    setPage(1);
                  }}
                >
                  Limpar filtros
                </button>
                <Link className="btn btn--ghost" to="/cadastro-voluntario">
                  Cadastrar um terreiro
                </Link>
              </div>
            </div>
          ) : view === "table" ? (
            <div className="tablewrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Nome do espaço</th>
                    <th>Tipo</th>
                    <th>Fundação</th>
                    <th>Nação</th>
                    <th>Bairro</th>
                    <th>Cidade</th>
                    <th>
                      <span className="skip-vis">Ação</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((c) => {
                    const place = communityPlace(c);
                    return (
                      <tr key={c.id}>
                        <td>{c.religiousSpaceName}</td>
                        <td>{capitalize(c.communityType ?? "")}</td>
                        <td>{c.religiousSpaceYearFoundation || "não informado"}</td>
                        <td>{capitalize(c.religiousSpaceNation ?? "")}</td>
                        <td>{place.neighborhood || "não informado"}</td>
                        <td>{place.city || "não informado"}</td>
                        <td>
                          <Link className="btn btn--quiet act" to={`/terreiro/${c.slugify ?? c.id}`}>
                            Ver ficha
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="cardgrid">
              {pageItems.map((c) => (
                <CommunityCard key={c.id} community={c} href={`/terreiro/${c.slugify ?? c.id}`} />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 ? (
          <nav className="pager" aria-label="Paginação">
            <p className="meta">
              Página {safePage} de {totalPages}
            </p>
            <div className="pager__btns">
              <button
                type="button"
                className="pager__btn"
                disabled={safePage <= 1}
                onClick={() => setPage(Math.max(1, safePage - 1))}
              >
                Anterior
              </button>
              {pageWindow(safePage, totalPages).map((p) => (
                <button
                  key={p}
                  type="button"
                  className="pager__btn"
                  aria-current={p === safePage ? "page" : undefined}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="pager__btn"
                disabled={safePage >= totalPages}
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
              >
                Próxima
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </>
  );
}

export default Search;
