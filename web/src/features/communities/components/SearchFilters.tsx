import React from "react";
import TextInput from "../../../components/ui/TextInput";
import Select from "../../../components/ui/Select";

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
  /** Quando informado, mostra o botão de limpar dentro do frame da busca. */
  onClear?: () => void;
  clearLabel?: string;
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
  onClear,
  clearLabel = "Limpar filtros",
}: SearchFiltersProps) {
  const controlled = value ?? filters;
  const [internal, setInternal] = React.useState<SearchFiltersValue>({});
  const current = controlled ?? internal;
  const hasValue = Boolean(
    current.query?.trim() || current.nation || current.city || current.type,
  );

  const emit = (next: SearchFiltersValue) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
    onFiltersChange?.(next);
    onFilter?.(next);
  };

  return (
    <div className="toolbar" role="search">
      <TextInput
        label="Buscar"
        placeholder="Nome, bairro ou cidade"
        value={current.query ?? ""}
        onChange={(e) => emit({ ...current, query: e.target.value })}
      />
      <div className="field">
        <label htmlFor="filter-nation">Nação</label>
        <Select
          id="filter-nation"
          value={current.nation ?? ""}
          onChange={(value) => emit({ ...current, nation: value })}
          options={nations.map((n) => ({ value: n, label: n }))}
          placeholder="Todas"
        />
      </div>
      <div className="field">
        <label htmlFor="filter-city">Cidade</label>
        <Select
          id="filter-city"
          value={current.city ?? ""}
          onChange={(value) => emit({ ...current, city: value })}
          options={cities.map((c) => ({ value: c, label: c }))}
          placeholder="Todas"
        />
      </div>
      <div className="field">
        <label htmlFor="filter-type">Tipo de comunidade</label>
        <Select
          id="filter-type"
          value={current.type ?? ""}
          onChange={(value) => emit({ ...current, type: value })}
          options={types.map((t) => ({ value: t, label: t }))}
          placeholder="Todos"
        />
      </div>

      {onClear && hasValue ? (
        <div className="toolbar__foot toolbar__foot--full">
          <button type="button" className="btn btn--quiet" onClick={onClear}>
            {clearLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default SearchFilters;
