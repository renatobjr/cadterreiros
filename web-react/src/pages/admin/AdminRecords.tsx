import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Select from "../../components/ui/Select";
import PageLoader from "../../components/composed/PageLoader";
import Pagination from "../../components/composed/Pagination";
import { decide } from "../../api/admin";
import DecisionDialog, {
  type DecisionAction,
} from "../../features/admin/components/DecisionDialog";
import AdminActionIcon from "../../features/admin/components/AdminActionIcon";
import { useAdminData } from "../../features/admin/adminDataContext";
import { useAuth } from "../../features/auth/context";
import {
  communityPlace,
  formatDate,
  typeLabel,
} from "../../features/communities/format";
import type { ReligiousCommunity } from "../../domain/types";

type TabKey = "all" | "pending" | "approved" | "rejected";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "Todos" },
  { key: "pending", label: "Pendentes" },
  { key: "approved", label: "Aprovados" },
  { key: "rejected", label: "Rejeitados" },
];

const ORIGINS = [
  { value: "censo", label: "Censo" },
  { value: "voluntario", label: "Voluntário" },
];

const SORTS = [
  { value: "updated", label: "Atualizado (recente)" },
  { value: "name", label: "Nome (A–Z)" },
  { value: "nation", label: "Nação (A–Z)" },
];

const PAGE_SIZE = 12;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matches(record: ReligiousCommunity, term: string): boolean {
  if (!term) return true;
  const haystack = [
    record.religiousSpaceName,
    record.religiousSpaceNation,
    record.communityType,
    record.censusTakerFullname,
    communityPlace(record).neighborhood,
    communityPlace(record).city,
  ]
    .filter(Boolean)
    .join(" ");

  return fold(haystack).includes(fold(term));
}

/** Lista administrativa de cadastros (mock: `renderAdminRecords`). */
export function AdminRecords() {
  const { records, counts, loading, error, reload } = useAdminData();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [params, setParams] = useSearchParams();
  const status = (params.get("status") as TabKey) || "all";

  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState("");
  const [nation, setNation] = useState("");
  const [city, setCity] = useState("");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);

  const [decision, setDecision] = useState<{
    id: string;
    name: string;
    action: DecisionAction;
  } | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkReject, setBulkReject] = useState<number | null>(null);
  const [bulkMessage, setBulkMessage] = useState("");

  const nations = useMemo(
    () =>
      [...new Set(records.map((item) => item.religiousSpaceNation).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .map((value) => ({ value, label: value })),
    [records],
  );

  const cities = useMemo(
    () =>
      [...new Set(records.map((item) => communityPlace(item).city).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "pt-BR"))
        .map((value) => ({ value, label: value })),
    [records],
  );

  const filtered = useMemo(() => {
    const list = records
      .filter((record) => (status === "all" ? true : record.censusStep === status))
      .filter((record) =>
        origin === "censo"
          ? !record.registeredVoluntarily
          : origin === "voluntario"
            ? record.registeredVoluntarily
            : true,
      )
      .filter((record) => (nation ? record.religiousSpaceNation === nation : true))
      .filter((record) => (city ? communityPlace(record).city === city : true))
      .filter((record) => matches(record, query));

    return list.sort((a, b) => {
      if (sort === "name") {
        return a.religiousSpaceName.localeCompare(b.religiousSpaceName, "pt-BR", {
          sensitivity: "base",
        });
      }
      if (sort === "nation") {
        return a.religiousSpaceNation.localeCompare(b.religiousSpaceNation, "pt-BR", {
          sensitivity: "base",
        });
      }
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
  }, [records, status, origin, nation, city, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function selectTab(tab: TabKey) {
    const next = new URLSearchParams(params);
    if (tab === "all") next.delete("status");
    else next.set("status", tab);
    setParams(next, { replace: true });
    setPage(1);
  }

  function resetFilters() {
    setQuery("");
    setOrigin("");
    setNation("");
    setCity("");
    setSort("updated");
    setPage(1);
  }

  async function approveRecord(record: ReligiousCommunity) {
    try {
      const ok = await decide("approve", { communityId: record.id });
      if (ok) reload();
      else setBulkMessage("Não foi possível aprovar o cadastro.");
    } catch {
      setBulkMessage("Falha ao aprovar o cadastro. Tente novamente.");
    }
  }

  async function confirmDecision(
    record: { id: string },
    action: DecisionAction,
    reason: string,
  ) {
    // Rejeitar e solicitar correções usam o mesmo campo (`rejectedReason`);
    // sem `userId`, a API mantém o responsável atual.
    const ok = await decide(action, {
      communityId: record.id,
      rejectedReason: reason,
    });
    if (!ok) throw new Error("A API recusou a solicitação.");
    reload();
  }

  const hasFilters = Boolean(query || origin || nation || city);

  /* Ações em lote só fazem sentido na fila: aprovados/rejeitados têm regras
     próprias e continuam sendo tratados na ficha. */
  const selectable = visible.filter((record) => record.censusStep === "pending");
  const allSelected =
    selectable.length > 0 && selectable.every((record) => selected.has(record.id));

  function toggleOne(id: string) {
    setBulkMessage("");
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleVisible() {
    setBulkMessage("");
    setSelected((current) => {
      const next = new Set(current);
      if (allSelected) selectable.forEach((record) => next.delete(record.id));
      else selectable.forEach((record) => next.add(record.id));
      return next;
    });
  }

  async function approveSelected() {
    const ids = [...selected];
    if (!ids.length) return;
    setBulkBusy(true);
    setBulkMessage("");
    try {
      const results = await Promise.all(
        ids.map((id) =>
          decide("approve", { communityId: id }).catch(() => false),
        ),
      );
      const ok = results.filter(Boolean).length;
      setBulkMessage(
        ok === ids.length
          ? `${ok} cadastro(s) aprovado(s).`
          : `${ok} de ${ids.length} aprovados; os demais falharam.`,
      );
      setSelected(new Set());
      reload();
    } finally {
      setBulkBusy(false);
    }
  }

  async function rejectSelected(reason: string) {
    const ids = [...selected];
    if (!ids.length) return;
    setBulkBusy(true);
    setBulkMessage("");
    try {
      const results = await Promise.all(
        ids.map((id) =>
          decide("reject", {
            communityId: id,
            rejectedReason: reason,
          }).catch(() => false),
        ),
      );
      const ok = results.filter(Boolean).length;
      setBulkMessage(
        ok === ids.length
          ? `${ok} cadastro(s) rejeitado(s).`
          : `${ok} de ${ids.length} rejeitados; os demais falharam.`,
      );
      setSelected(new Set());
      reload();
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <>
      <div className="admin-page-head">
        <div className="admin-page-head__text">
          <p className="eyebrow">Cadastros</p>
          <h1 className="display-1">Fila da curadoria</h1>
          <p className="lede">
            Todos os registros do censo e as contribuições enviadas pelo site.
          </p>
          <div className="admin-page-head__meta">
            <span>{counts.pending} pendentes</span>
            <span>{counts.approved} aprovados</span>
            <span>{counts.rejected} rejeitados</span>
          </div>
        </div>
      </div>

      <div className="tabs admin-tabs" role="tablist" aria-label="Estágio do censo">
        {TABS.map((tab) => {
          const count =
            tab.key === "all" ? counts.total : counts[tab.key as "pending"];
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              className="tab"
              aria-selected={status === tab.key}
              onClick={() => selectTab(tab.key)}
            >
              {tab.label}
              <span className="admin-tab__count">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        className="filterbar admin-filterbar"
        role="search"
        aria-label="Filtros de cadastros"
      >
        <div className="field">
          <label htmlFor="admin-search">Buscar</label>
          <input
            id="admin-search"
            className="input"
            placeholder="Nome, bairro, cidade ou nação"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="admin-origin">Origem</label>
          <Select
            id="admin-origin"
            value={origin}
            onChange={(value) => {
              setOrigin(value);
              setPage(1);
            }}
            options={ORIGINS}
            placeholder="Todas as origens"
          />
        </div>
        <div className="field">
          <label htmlFor="admin-nation">Nação</label>
          <Select
            id="admin-nation"
            value={nation}
            onChange={(value) => {
              setNation(value);
              setPage(1);
            }}
            options={nations}
            placeholder="Todas as nações"
          />
        </div>
        <div className="field">
          <label htmlFor="admin-city">Cidade</label>
          <Select
            id="admin-city"
            value={city}
            onChange={(value) => {
              setCity(value);
              setPage(1);
            }}
            options={cities}
            placeholder="Todas as cidades"
          />
        </div>
        <div className="field">
          <label htmlFor="admin-sort">Ordenar por</label>
          <Select
            id="admin-sort"
            value={sort}
            onChange={setSort}
            options={SORTS}
            placeholder="Atualizado (recente)"
          />
        </div>
        <div className="filterbar__actions">
          <button
            className="btn btn--quiet"
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters && sort === "updated"}
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="admin-results-head">
        <div>
          <p className="admin-results-head__count">
            {filtered.length}{" "}
            {filtered.length === 1 ? "cadastro encontrado" : "cadastros encontrados"}
          </p>
        </div>
      </div>

      {isAdmin && selected.size > 0 ? (
        <div className="admin-bulk" role="region" aria-label="Ações em lote">
          <p className="admin-bulk__count">
            {selected.size}{" "}
            {selected.size === 1 ? "cadastro selecionado" : "cadastros selecionados"}
          </p>
          <div className="admin-bulk__actions">
            <button
              className="btn btn--primary"
              type="button"
              disabled={bulkBusy}
              onClick={() => void approveSelected()}
            >
              Aprovar selecionados
            </button>
            <button
              className="btn btn--danger"
              type="button"
              disabled={bulkBusy}
              onClick={() => setBulkReject(selected.size)}
            >
              Rejeitar selecionados
            </button>
            <button
              className="btn btn--quiet"
              type="button"
              disabled={bulkBusy}
              onClick={() => setSelected(new Set())}
            >
              Limpar seleção
            </button>
          </div>
        </div>
      ) : null}

      {bulkMessage ? (
        <p className="admin-bulk__msg" role="status">
          {bulkMessage}
        </p>
      ) : null}

      {loading ? (
        <PageLoader compact label="Carregando cadastros" />
      ) : error ? (
        <div className="admin-empty">
          <p>Não foi possível carregar os cadastros.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty admin-empty--page">
          <p>Nenhum cadastro corresponde aos filtros.</p>
          <button className="btn btn--ghost" type="button" onClick={resetFilters}>
            Limpar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="tablewrap admin-tablewrap">
            <table className="data admin-table">
              <thead>
                <tr>
                  {isAdmin ? (
                    <th scope="col" className="admin-check">
                      <input
                        type="checkbox"
                        aria-label="Selecionar pendentes desta página"
                        checked={allSelected}
                        onChange={toggleVisible}
                        disabled={selectable.length === 0 || bulkBusy}
                      />
                    </th>
                  ) : null}
                  <th scope="col">Cadastro</th>
                  <th scope="col">Origem</th>
                  <th scope="col">Status</th>
                  <th scope="col">Tipo / nação</th>
                  <th scope="col">Local</th>
                  <th scope="col">Recenseador</th>
                  <th scope="col">Atualizado</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((record) => {
                  const isOwner =
                    String(record.censusTakerId ?? "") === String(user?.id ?? "-");
                  const canEdit = isAdmin || isOwner;

                  return (
                    <tr key={record.id}>
                      {isAdmin ? (
                        <td className="admin-check">
                          <input
                            type="checkbox"
                            aria-label={`Selecionar ${record.religiousSpaceName}`}
                            checked={selected.has(record.id)}
                            onChange={() => toggleOne(record.id)}
                            disabled={record.censusStep !== "pending" || bulkBusy}
                          />
                        </td>
                      ) : null}
                      <td>
                        <Link
                          className="admin-name"
                          to={`/admin/cadastros/${record.id}`}
                        >
                          {record.religiousSpaceName}
                        </Link>
                        <span className="admin-cell-line admin-cell-line--muted">
                          {record.religiousSpaceYearFoundation
                            ? `Fundação ${record.religiousSpaceYearFoundation}`
                            : "Fundação não informada"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-origin ${
                            record.registeredVoluntarily
                              ? "admin-origin--voluntario"
                              : "admin-origin--censo"
                          }`}
                        >
                          <span className="admin-origin__dot" aria-hidden="true" />
                          {record.registeredVoluntarily ? "Voluntário" : "Censo"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status admin-status--${record.censusStep}`}
                        >
                          <span className="admin-status__dot" aria-hidden="true" />
                          {STATUS_LABEL[record.censusStep] ?? record.censusStep}
                        </span>
                      </td>
                      <td>
                        <span className="admin-cell-line">
                          {record.religiousSpaceNation}
                        </span>
                        <span className="admin-cell-line admin-cell-line--muted">
                          {typeLabel(record.communityType)}
                        </span>
                      </td>
                      <td>{communityPlace(record).label || "não informado"}</td>
                      <td>{record.censusTakerFullname || "não informado"}</td>
                      <td>{formatDate(record.updatedAt)}</td>
                      <td>
                        <div className="admin-actions" role="group" aria-label={`Ações de ${record.religiousSpaceName}`}>
                          {isAdmin ? (
                            <>
                              {record.censusStep !== "approved" ? (
                                <button
                                  className="admin-action admin-action--icon"
                                  type="button"
                                  aria-label="Aprovar cadastro"
                                  data-tooltip="Aprovar"
                                  onClick={() => void approveRecord(record)}
                                >
                                  <AdminActionIcon kind="approve" />
                                </button>
                              ) : null}
                              {/* Rejeitado segue para aprovação/correções, não
                                  para nova rejeição. */}
                              {record.censusStep === "pending" ? (
                                <button
                                  className="admin-action admin-action--icon admin-action--danger"
                                  type="button"
                                  aria-label="Rejeitar cadastro"
                                  data-tooltip="Rejeitar"
                                  onClick={() =>
                                    setDecision({
                                      id: record.id,
                                      name: record.religiousSpaceName,
                                      action: "reject",
                                    })
                                  }
                                >
                                  <AdminActionIcon kind="reject" />
                                </button>
                              ) : null}
                              <button
                                className="admin-action admin-action--icon"
                                type="button"
                                aria-label="Solicitar correções"
                                data-tooltip="Solicitar correções"
                                onClick={() =>
                                  setDecision({
                                    id: record.id,
                                    name: record.religiousSpaceName,
                                    action: "corrections",
                                  })
                                }
                              >
                                <AdminActionIcon kind="corrections" />
                              </button>
                            </>
                          ) : null}
                          {canEdit ? (
                            <Link
                              className="admin-action admin-action--icon"
                              to={`/admin/cadastros/${record.id}/editar`}
                              aria-label="Editar cadastro"
                              data-tooltip="Editar"
                            >
                              <AdminActionIcon kind="edit" />
                            </Link>
                          ) : (
                            <span className="admin-muted">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 ? (
            <Pagination page={currentPage} totalPages={pages} onChange={setPage} />
          ) : null}
        </>
      )}

      <DecisionDialog
        record={
          bulkReject
            ? {
                id: "bulk",
                name: `${bulkReject} ${
                  bulkReject === 1 ? "cadastro selecionado" : "cadastros selecionados"
                }`,
              }
            : null
        }
        action="reject"
        onClose={() => setBulkReject(null)}
        onConfirm={async (_record, _action, reason) => {
          await rejectSelected(reason);
        }}
      />

      <DecisionDialog
        record={
          decision ? { id: decision.id, name: decision.name } : null
        }
        action={decision?.action ?? "reject"}
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
      />
    </>
  );
}

export default AdminRecords;
