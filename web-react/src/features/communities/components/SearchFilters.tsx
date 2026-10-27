import React from "react";
import TextInput from "../../../components/ui/TextInput";

export interface SearchFiltersValue {
  query?: string;
  nation?: string;
  city?: string;
  type?: string;
}

export interface SearchFiltersProps {
  value?: SearchFiltersValue;
  filters?: SearchFiltersValue;
  onChange?: (next: SearchFiltersValue) => void;
  onFiltersChange?: (next: SearchFiltersValue) => void;
  onFilter?: (next: SearchFiltersValue) => void;
  nations?: string[];
  cities?: string[];
  types?: string[];
}

export function SearchFilters({
  value,
  filters,
  onChange,
  onFiltersChange,
  onFilter,
  nations = [],
  cities = [],
  types = [],
}: SearchFiltersProps) {
  const controlled = value ?? filters;
  const [internal, setInternal] = React.useState<SearchFiltersValue>({});
  const current = controlled ?? internal;

  const emit = (next: SearchFiltersValue) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
    onFiltersChange?.(next);
    onFilter?.(next);
  };

  return (
    <div className="toolbar" role="search">
      <TextInput
        label="Busca"
        placeholder="Buscar comunidade"
        value={current.query ?? ""}
        onChange={(e) => emit({ ...current, query: e.target.value })}
      />
      <div className="field">
        <label htmlFor="filter-nation">Nação</label>
        <select
          id="filter-nation"
          className="select"
          value={current.nation ?? ""}
          onChange={(e) => emit({ ...current, nation: e.target.value })}
        >
          <option value="">Todas</option>
          {nations.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-city">Cidade</label>
        <select
          id="filter-city"
          className="select"
          value={current.city ?? ""}
          onChange={(e) => emit({ ...current, city: e.target.value })}
        >
          <option value="">Todas</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="filter-type">Tipo</label>
        <select
          id="filter-type"
          className="select"
          value={current.type ?? ""}
          onChange={(e) => emit({ ...current, type: e.target.value })}
        >
          <option value="">Todos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SearchFilters;
