import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowIcon from "../../components/ui/ArrowIcon";
import DecisionDialog, {
  type DecisionAction,
  type DecisionTarget,
} from "../../features/admin/components/DecisionDialog";
import ActionMenu, {
  type ActionMenuItem,
} from "../../features/admin/components/ActionMenu";
import AdminActionIcon from "../../features/admin/components/AdminActionIcon";
import LeafletMap from "../../features/metrics/components/LeafletMap";
import { decide, getCommunity } from "../../api/admin";
import { useAuth } from "../../features/auth/context";
import { useAdminData } from "../../features/admin/adminDataContext";
import {
  communityPhotoUrl,
  communityPlace,
  coordinatesLabel,
  formatDate,
  typeLabel,
  validYear,
  yearLabel,
} from "../../features/communities/format";
import type { ReligiousCommunity } from "../../domain/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

function Fact({
  label,
  value,
  full,
  empty,
}: {
  label: string;
  value: string;
  full?: boolean;
  empty?: boolean;
}) {
  return (
    <div className={`admin-fact${full ? " admin-fact--full" : ""}`}>
      <dt>{label}</dt>
      <dd className={empty ? "is-empty" : undefined}>{value}</dd>
    </div>
  );
}

/** Ficha interna do cadastro (mock: `renderAdminDetail`). */
export function AdminCommunity() {
  const { id = "" } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { reload } = useAdminData();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  const [community, setCommunity] = useState<ReligiousCommunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [acting, setActing] = useState(false);
  const [decision, setDecision] = useState<{
    record: DecisionTarget;
    action: DecisionAction;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getCommunity(id);
      setCommunity(data);
      if (!data) setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const origin = community?.registeredVoluntarily ? "Voluntário" : "Censo";
  const photo = community ? communityPhotoUrl(community) : null;
  const place = community ? communityPlace(community) : null;
  const address = community?.communityAddress;
  const contacts = community?.leaderContacts;
  const coordinates = community
    ? coordinatesLabel(
        community.communityGoogleApiLocalization?.lat ?? community.lat,
        community.communityGoogleApiLocalization?.long ?? community.long,
      )
    : "";
  const hasCoordinates = Boolean(
    community &&
      Number.isFinite(
        community.communityGoogleApiLocalization?.lat ?? community.lat,
      ) &&
      Number.isFinite(
        community.communityGoogleApiLocalization?.long ?? community.long,
      ),
  );

  const isOwner =
    String(community?.censusTakerId ?? "") === String(user?.id ?? "-");
  const canEdit = Boolean(community) && (isAdmin || isOwner);
  const canDecide = Boolean(community) && isAdmin;

  const history = useMemo(() => {
    if (!community) return [];
    const items: Array<{ date: string; title: string; text: string }> = [];

    items.push({
      date: formatDate(community.createdAt),
      title: "Recebido",
      text: origin,
    });

    if (community.censusTakerFullname) {
      items.push({
        date: formatDate(community.createdAt),
        title: "Atribuído à curadoria",
        text: community.censusTakerFullname,
      });
    }

    if (community.rejectedReason) {
      items.push({
        date: formatDate(community.updatedAt),
        title:
          community.censusStep === "rejected"
            ? "Rejeitado"
            : "Correções solicitadas",
        text: community.rejectedReason,
      });
    }

    if (community.censusStep === "approved") {
      items.push({
        date: formatDate(community.updatedAt),
        title: "Aprovado",
        text: "Cadastro publicado no acervo.",
      });
    }

    if (community.censusStep === "pending") {
      items.push({
        date: formatDate(community.updatedAt),
        title: "Aguardando análise",
        text: "Última atualização do cadastro.",
      });
    }

    return items;
  }, [community, origin]);

  async function approve() {
    if (!community) return;
    setActing(true);
    try {
      const ok = await decide("approve", { communityId: community.id });
      if (ok) {
        await load();
        reload();
      }
    } finally {
      setActing(false);
    }
  }

  async function confirmDecision(
    record: DecisionTarget,
    action: DecisionAction,
    reason: string,
  ) {
    const ok = await decide(action, {
      communityId: record.id,
      ...(action === "reject"
        ? { rejectedReason: reason }
        : { correctionNotes: reason }),
    });
    if (ok) {
      await load();
      reload();
    }
  }

  if (loading) {
    return (
      <p className="admin-muted" role="status" aria-live="polite">
        Carregando cadastro…
      </p>
    );
  }

  if (error || !community || !place) {
    return (
      <div className="admin-page-head">
        <div className="admin-page-head__text">
          <p className="eyebrow">Curadoria</p>
          <h1 className="display-1">Cadastro não encontrado</h1>
          <p className="lede">
            O registro pode ter sido removido ou o endereço está incompleto.
          </p>
        </div>
        <div className="admin-page-head__actions">
          <Link className="btn btn--primary" to="/admin/cadastros">
            Voltar para cadastros <ArrowIcon />
          </Link>
        </div>
      </div>
    );
  }

  const founded = validYear(community.religiousSpaceYearFoundation);

  const menuItems: ActionMenuItem[] = [
    ...(canDecide
      ? [
          {
            id: "corrections",
            label: "Solicitar correções",
            icon: "corrections" as const,
            onSelect: () =>
              setDecision({
                record: {
                  id: community.id,
                  name: community.religiousSpaceName,
                },
                action: "corrections" as DecisionAction,
              }),
          },
        ]
      : []),
    ...(canEdit
      ? [
          {
            id: "edit",
            label: "Editar cadastro",
            icon: "edit" as const,
            onSelect: () =>
              navigate(`/admin/cadastros/${community.id}/editar`),
          },
        ]
      : []),
  ];

  // O DTO administrativo entrega as coordenadas em `communityGoogleApiLocalization`;
  // o mapa lê `lat`/`long` — normalizamos para o marcador aparecer.
  const mapCommunity = {
    ...community,
    lat: community.communityGoogleApiLocalization?.lat ?? community.lat,
    long: community.communityGoogleApiLocalization?.long ?? community.long,
  };

  return (
    <>
      <div className="admin-page-head admin-detail-head">
        <div className="admin-page-head__text">
          <Link className="admin-back" to="/admin/cadastros">
            Voltar para cadastros
          </Link>
          <p className="eyebrow">Ficha de cadastro · {origin}</p>
          <h1 className="display-1">{community.religiousSpaceName}</h1>
          <p className="lede">
            {place.label || "Local não informado"} ·{" "}
            {typeLabel(community.communityType)}
          </p>
          <div className="admin-detail-tags">
            <span className={`admin-status admin-status--${community.censusStep}`}>
              <span className="admin-status__dot" aria-hidden="true" />
              {STATUS_LABEL[community.censusStep] ?? community.censusStep}
            </span>
            <span
              className={`admin-origin ${
                community.registeredVoluntarily
                  ? "admin-origin--voluntario"
                  : "admin-origin--censo"
              }`}
            >
              <span className="admin-origin__dot" aria-hidden="true" />
              {origin}
            </span>
          </div>

          {/* Por estado do censo:
              - pendente: decisão à vista (aprovar/rejeitar) + menu com as demais;
              - aprovado: os dois botões de manutenção, sem menu;
              - rejeitado: aprovar + menu. */}
          <div className="admin-page-head__actions admin-detail-actions">
            {!canDecide && canEdit ? (
              <Link
                className="btn btn--ghost"
                to={`/admin/cadastros/${community.id}/editar`}
              >
                <AdminActionIcon kind="edit" />
                Editar cadastro
              </Link>
            ) : null}

            {canDecide && community.censusStep === "pending" ? (
              <>
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={acting}
                  onClick={() => void approve()}
                >
                  <AdminActionIcon kind="approve" />
                  {acting ? "Aprovando…" : "Aprovar"}
                </button>

                <button
                  className="btn btn--danger"
                  type="button"
                  onClick={() =>
                    setDecision({
                      record: {
                        id: community.id,
                        name: community.religiousSpaceName,
                      },
                      action: "reject",
                    })
                  }
                >
                  <AdminActionIcon kind="reject" />
                  Rejeitar
                </button>

                <ActionMenu label="Mais ações" items={menuItems} />
              </>
            ) : null}

            {canDecide && community.censusStep === "approved" ? (
              <>
                <button
                  className="btn btn--ghost"
                  type="button"
                  onClick={() =>
                    setDecision({
                      record: {
                        id: community.id,
                        name: community.religiousSpaceName,
                      },
                      action: "corrections",
                    })
                  }
                >
                  <AdminActionIcon kind="corrections" />
                  Solicitar correções
                </button>

                <Link
                  className="btn btn--primary"
                  to={`/admin/cadastros/${community.id}/editar`}
                >
                  <AdminActionIcon kind="edit" />
                  Editar cadastro
                </Link>
              </>
            ) : null}

            {canDecide && community.censusStep === "rejected" ? (
              <>
                <button
                  className="btn btn--primary"
                  type="button"
                  disabled={acting}
                  onClick={() => void approve()}
                >
                  <AdminActionIcon kind="approve" />
                  {acting ? "Aprovando…" : "Aprovar"}
                </button>

                <ActionMenu label="Mais ações" items={menuItems} />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="admin-detail-layout">
        <div className="admin-detail-main">
          <figure className="admin-detail__figure">
            {photo ? (
              <img
                className="admin-detail__photo"
                src={photo}
                alt={`Fotografia do terreiro ${community.religiousSpaceName}`}
              />
            ) : (
              <div className="admin-detail__photo admin-photo-empty">
                Sem fotografia no acervo
              </div>
            )}
            <figcaption className="meta">
              {photo
                ? "Fotografia do acervo do cadastro."
                : "Este cadastro ainda não tem fotografia."}
            </figcaption>
          </figure>

          <section className="admin-section">
            <h2 className="display-3">Sobre a comunidade</h2>
            <p className="admin-bio">
              {community.bio || "Não informado no censo."}
            </p>
          </section>

          <section className="admin-section">
            <h2 className="display-3">Dados da casa e da liderança</h2>
            <dl className="admin-facts">
              <Fact label="Tipo" value={typeLabel(community.communityType)} />
              <Fact label="Nação" value={community.religiousSpaceNation} />
              <Fact
                label="Idioma ritual"
                value={community.religiousSpacePraticalLanguages ?? "não informado"}
                empty={!community.religiousSpacePraticalLanguages}
              />
              <Fact
                label="Fundação"
                value={yearLabel(community.religiousSpaceYearFoundation)}
                empty={!founded}
              />
              <Fact
                label="Fundador da liderança"
                value={community.religiousSpaceLeaderFoundation || "não informado"}
                empty={!community.religiousSpaceLeaderFoundation}
              />
              <Fact
                label="Iniciado por"
                value={community.religiousSpaceStartedBy || "não informado"}
                empty={!community.religiousSpaceStartedBy}
              />
              <Fact
                label="Data de início"
                value={formatDate(community.religiousSpaceNameDateStartedBy)}
                empty={!community.religiousSpaceNameDateStartedBy}
              />
              <Fact
                label="Liderança"
                value={community.religiousSpaceLeaderName || "não informado"}
                empty={!community.religiousSpaceLeaderName}
              />
              <Fact
                label="Cargo ou função"
                value={community.religiousSpacePositionName || "não informado"}
                empty={!community.religiousSpacePositionName}
              />
              <Fact
                label="Gênero"
                value={community.leaderGender || "não informado"}
                empty={!community.leaderGender}
              />
              <Fact
                label="Etnia / raça-cor"
                value={community.leaderEthnicity || "não informado"}
                empty={!community.leaderEthnicity}
              />
              <Fact
                label="Escolaridade"
                value={community.leaderEducationalLevel || "não informado"}
                empty={!community.leaderEducationalLevel}
              />
              <Fact
                label="Sofreu racismo?"
                value={
                  community.leaderSufferedRacism === true
                    ? "Sim"
                    : community.leaderSufferedRacism === false
                      ? "Não"
                      : "Não informado"
                }
              />
              <Fact
                label="Situação"
                value={
                  community.religiousSpaceStatus === "inactive"
                    ? "Inativo"
                    : "Ativo"
                }
              />
              <Fact
                label="E-mail"
                value={
                  typeof contacts?.email === "string"
                    ? contacts.email
                    : "não informado"
                }
                empty={!contacts?.email}
              />
              <Fact
                label="Celular"
                value={
                  contacts?.mobile !== undefined
                    ? String(contacts.mobile)
                    : "não informado"
                }
                empty={contacts?.mobile === undefined}
              />
              <Fact
                label="Telefone"
                value={
                  contacts?.phone !== undefined
                    ? String(contacts.phone)
                    : "não informado"
                }
                empty={contacts?.phone === undefined}
              />
              <Fact
                label="Endereço"
                value={
                  address?.fullAddress ||
                  [address?.street, address?.number]
                    .filter(Boolean)
                    .join(", ") ||
                  "não informado"
                }
                full
                empty={!address?.fullAddress && !address?.street}
              />
              <Fact
                label="Bairro"
                value={place.neighborhood || "não informado"}
                empty={!place.neighborhood}
              />
              <Fact
                label="Cidade"
                value={place.city || "não informado"}
                empty={!place.city}
              />
              <Fact
                label="CEP"
                value={address?.zipcode || "não informado"}
                empty={!address?.zipcode}
              />
              {community.rejectedReason ? (
                <Fact
                  label="Motivo da última correção"
                  value={community.rejectedReason}
                  full
                />
              ) : null}
            </dl>
          </section>
        </div>

        <aside className="admin-detail-aside">
          <section className="admin-panel">
            <p className="eyebrow">Situação</p>
            <h2 className="display-3">Resumo do registro</h2>
            <dl className="admin-summary">
              <div>
                <dt>Status</dt>
                <dd>
                  <span
                    className={`admin-status admin-status--${community.censusStep}`}
                  >
                    <span className="admin-status__dot" aria-hidden="true" />
                    {STATUS_LABEL[community.censusStep] ?? community.censusStep}
                  </span>
                </dd>
              </div>
              <div>
                <dt>Origem</dt>
                <dd>{origin}</dd>
              </div>
              <div>
                <dt>Protocolo</dt>
                <dd>#{community.id.slice(-6).toUpperCase()}</dd>
              </div>
              <div>
                <dt>Recebido</dt>
                <dd>{formatDate(community.createdAt)}</dd>
              </div>
              <div>
                <dt>Atualizado</dt>
                <dd>{formatDate(community.updatedAt)}</dd>
              </div>
              <div>
                <dt>Recenseador</dt>
                <dd>
                  {community.censusTakerFullname &&
                  community.censusTakerFullname !== "não informado"
                    ? community.censusTakerFullname
                    : "Aguardando atribuição"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="admin-panel">
            <p className="eyebrow">Território</p>
            <h2 className="display-3">No mapa</h2>
            {hasCoordinates ? (
              <LeafletMap
                communities={[mapCommunity]}
                className="mapbox mapbox--single"
                height={240}
                maxZoom={14}
              />
            ) : (
              <div className="mapbox mapbox--single">
                <div className="map-empty">Localização não informada.</div>
              </div>
            )}
            <p className="meta admin-detail-note">
              {hasCoordinates
                ? coordinates
                : "Coordenadas não informadas."}
            </p>
          </section>

          <section className="admin-panel">
            <p className="eyebrow">Histórico</p>
            <h2 className="display-3">Linha do tempo</h2>
            <ol className="admin-history">
              {history.map((item, index) => (
                <li key={`${item.title}-${index}`}>
                  <span className="admin-history__date">{item.date}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <p className="meta admin-detail-note">
            Contatos e perfil socioeconômico são dados internos da curadoria e
            não aparecem na ficha pública.
          </p>
        </aside>
      </div>

      <DecisionDialog
        record={decision?.record ?? null}
        action={decision?.action ?? "reject"}
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
      />
    </>
  );
}

export default AdminCommunity;
