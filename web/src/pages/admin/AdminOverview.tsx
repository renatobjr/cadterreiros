import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ArrowIcon from "../../components/ui/ArrowIcon";
import PageLoader from "../../components/composed/PageLoader";
import { useAdminData } from "../../features/admin/adminDataContext";
import { listUsers, statsPhotoCoverage } from "../../api/admin";
import { useAuth } from "../../features/auth/context";
import {
  communityPlace,
  formatDate,
  typeLabel,
} from "../../features/communities/format";
import type { PhotoCoverageStats, ReligiousCommunity } from "../../domain/types";

function statusLabel(record: ReligiousCommunity): string {
  if (record.censusStep === "approved") return "Aprovado";
  if (record.censusStep === "rejected") return "Rejeitado";
  return "Pendente";
}

function StatusChip({ record }: { record: ReligiousCommunity }) {
  return (
    <span className={`admin-status admin-status--${record.censusStep}`}>
      <span className="admin-status__dot" aria-hidden="true" />
      {statusLabel(record)}
    </span>
  );
}

function OriginTag({ record }: { record: ReligiousCommunity }) {
  const volunteer = record.registeredVoluntarily;
  return (
    <span
      className={`admin-origin ${
        volunteer ? "admin-origin--voluntario" : "admin-origin--censo"
      }`}
    >
      <span className="admin-origin__dot" aria-hidden="true" />
      {volunteer ? "Voluntário" : "Censo"}
    </span>
  );
}

export function AdminOverview() {
  const { records, counts, loading, error } = useAdminData();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [users, setUsers] = useState(0);
  const [photos, setPhotos] = useState<PhotoCoverageStats | null>(null);

  useEffect(() => {
    let active = true;

    if (isAdmin) {
      listUsers()
        .then((data) => {
          if (active) setUsers(data.length);
        })
        .catch(() => undefined);
    }

    statsPhotoCoverage()
      .then((data) => {
        if (active) setPhotos(data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const pending = useMemo(
    () =>
      records
        .filter((record) => record.censusStep === "pending")
        .slice(0, 5),
    [records],
  );

  const recent = useMemo(
    () =>
      records
        .filter((record) => record.censusStep !== "pending")
        .slice()
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
        .slice(0, 3),
    [records],
  );

  return (
    <>
      <div className="admin-page-head">
        <div className="admin-page-head__text">
          <p className="eyebrow">Visão geral</p>
          <h1 className="display-1">Painel da curadoria</h1>
          <p className="lede">
            Acompanhe o acervo aprovado e as contribuições que chegam pelo site.
          </p>
          <div className="admin-page-head__meta">
            <span>{counts.pending} pendentes</span>
            <span>{counts.approved} aprovados</span>
            <span>{counts.rejected} rejeitados</span>
          </div>
        </div>
        <div className="admin-page-head__actions">
          <Link className="btn btn--ghost" to="/admin/cadastros?status=pending">
            Abrir fila <ArrowIcon />
          </Link>
        </div>
      </div>

      {loading ? (
        <PageLoader compact label="Carregando painel" />
      ) : error ? (
        <div className="admin-empty">
          <p>Não foi possível carregar os cadastros.</p>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            <Link
              className={`admin-stat${counts.pending > 0 ? " admin-stat--attention" : ""}`}
              to="/admin/cadastros?status=pending"
            >
              <span className="admin-stat__label">Pendentes</span>
              <span className="admin-stat__num">{counts.pending}</span>
              <span className="admin-stat__meta">
                {counts.volunteers} voluntários ·{" "}
                {Math.max(counts.pending - counts.volunteers, 0)} do censo
              </span>
            </Link>
            <Link className="admin-stat" to="/admin/cadastros?status=approved">
              <span className="admin-stat__label">Aprovados</span>
              <span className="admin-stat__num">{counts.approved}</span>
              <span className="admin-stat__meta">no acervo da curadoria</span>
            </Link>
            <Link className="admin-stat" to="/admin/cadastros?status=rejected">
              <span className="admin-stat__label">Rejeitados</span>
              <span className="admin-stat__num">{counts.rejected}</span>
              <span className="admin-stat__meta">aguardando correções</span>
            </Link>
            <Link className="admin-stat" to={isAdmin ? "/admin/usuarios" : "/admin"}>
              <span className="admin-stat__label">Usuários</span>
              <span className="admin-stat__num">{isAdmin ? users : "—"}</span>
              <span className="admin-stat__meta">
                {isAdmin ? "perfis cadastrados" : "restrito à curadoria"}
              </span>
            </Link>
          </div>

          <div className="admin-overview-grid">
            <section className="admin-panel">
              <div className="admin-panel__head">
                <div>
                  <p className="eyebrow">Fila de aprovação</p>
                  <h2 className="display-3">Contribuições recentes</h2>
                </div>
                <Link className="pill-link" to="/admin/cadastros?status=pending">
                  Ver todos <ArrowIcon />
                </Link>
              </div>

              {pending.length > 0 ? (
                <ul className="admin-queue">
                  {pending.map((record) => (
                    <li className="admin-queue__item" key={record.id}>
                      <div className="admin-queue__main">
                        <p className="admin-queue__name">
                          <Link to={`/admin/cadastros/${record.id}`}>
                            {record.religiousSpaceName}
                          </Link>
                        </p>
                        <p className="admin-queue__meta">
                          <OriginTag record={record} />
                          <span>{typeLabel(record.communityType)}</span>
                          <span>{record.religiousSpaceNation}</span>
                          <span>{communityPlace(record).label}</span>
                        </p>
                      </div>
                      <div className="admin-queue__side">
                        <span className="admin-queue__date">
                          {formatDate(record.createdAt)}
                        </span>
                        <Link
                          className="admin-action"
                          to={`/admin/cadastros/${record.id}`}
                        >
                          Revisar
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="admin-empty">
                  <p>Nenhum cadastro aguardando análise.</p>
                  <Link className="btn btn--ghost" to="/admin/cadastros?status=approved">
                    Ver acervo aprovado
                  </Link>
                </div>
              )}
            </section>

            <aside className="admin-overview__aside">
              <section className="admin-panel">
                <p className="eyebrow">Acervo</p>
                <h2 className="display-3">Resumo do mapeamento</h2>
                <dl className="admin-summary">
                  <div>
                    <dt>Terreiros aprovados</dt>
                    <dd>{counts.approved}</dd>
                  </div>
                  <div>
                    <dt>Com fotografia</dt>
                    <dd>{photos?.withPhoto ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Sem fotografia</dt>
                    <dd>{photos?.withoutPhoto ?? "—"}</dd>
                  </div>
                  <div>
                    <dt>Total no censo</dt>
                    <dd>{counts.total}</dd>
                  </div>
                </dl>
                <Link className="pill-link mt-6" to="/mapeamento">
                  Abrir mapeamento público <ArrowIcon />
                </Link>
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Últimas decisões</p>
                <h2 className="display-3">Atividade recente</h2>
                {recent.length > 0 ? (
                  <ul className="admin-activity">
                    {recent.map((record) => (
                      <li key={record.id}>
                        <div>
                          <Link to={`/admin/cadastros/${record.id}`}>
                            {record.religiousSpaceName}
                          </Link>
                          <span>{formatDate(record.updatedAt)}</span>
                        </div>
                        <StatusChip record={record} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-muted">Sem decisões registradas.</p>
                )}
              </section>

              <section className="admin-panel">
                <p className="eyebrow">Atalhos</p>
                <h2 className="display-3">Ações rápidas</h2>
                <ul className="admin-quick">
                  {isAdmin ? (
                    <li>
                      <Link to="/admin/usuarios">
                        Gerenciar usuários <ArrowIcon />
                      </Link>
                    </li>
                  ) : null}
                  <li>
                    <Link to="/">
                      Ver site público <ArrowIcon />
                    </Link>
                  </li>
                </ul>
              </section>
            </aside>
          </div>
        </>
      )}
    </>
  );
}

export default AdminOverview;
