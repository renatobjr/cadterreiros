import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { CSSProperties } from "react";
import { communitiesApi } from "../api/communities";
import type { ReligiousCommunity } from "../domain/types";
import ArrowIcon from "../components/ui/ArrowIcon";
import PageLoader from "../components/composed/PageLoader";
import CommunityCard from "../features/communities/components/CommunityCard";
import LeafletMap from "../features/metrics/components/LazyLeafletMap";
import { copyToClipboard } from "../utils/clipboard";
import {
  trackCommunitySelect,
  trackCommunityView,
} from "../features/analytics/events";
import { applySeo } from "../utils/seo";
import {
  capitalize,
  communityPhotoUrl,
  communityPlace,
  coordinatesLabel,
  formatDate,
  nationKey,
  placeLabel,
  typeLabel,
  validYear,
  yearLabel,
} from "../features/communities/format";

export interface CommunityProps {
  /** Ficha por id (usado em testes e em links legados). */
  id?: string;
  /** Ficha por slug (rota `/terreiro/:slug`). */
  slug?: string;
}

type LoadStatus = "loading" | "ready" | "missing" | "error";

interface FichaRow {
  label: string;
  value: string;
  empty?: boolean;
  /** Quando informado, a linha mostra o ponto da nação antes do valor. */
  dot?: string;
}

/** Cards de "Terreiros próximos": mesmo bairro primeiro, depois mesma nação. */
function relatedCommunities(
  current: ReligiousCommunity,
  all: ReligiousCommunity[],
): ReligiousCommunity[] {
  const place = communityPlace(current);
  const others = all.filter(
    (item) => item.id !== current.id && item.slugify !== current.slugify,
  );

  const sameNeighborhood = others.filter(
    (item) =>
      place.neighborhood &&
      communityPlace(item).neighborhood === place.neighborhood,
  );
  const sameNation = others.filter(
    (item) =>
      item.religiousSpaceNation === current.religiousSpaceNation &&
      !sameNeighborhood.includes(item),
  );

  return [...sameNeighborhood, ...sameNation]
    .sort((a, b) => {
      const photoDelta =
        (b.religiousSpaceMainPicture ? 1 : 0) -
        (a.religiousSpaceMainPicture ? 1 : 0);
      if (photoDelta !== 0) return photoDelta;
      return a.religiousSpaceName.localeCompare(b.religiousSpaceName, "pt-BR", {
        sensitivity: "base",
      });
    })
    .slice(0, 3);
}

function fichaRows(community: ReligiousCommunity): FichaRow[] {
  const place = communityPlace(community);
  const nation = community.religiousSpaceNation;
  const language = community.religiousSpacePraticalLanguages;

  return [
    {
      label: "Fundação",
      value: yearLabel(community.religiousSpaceYearFoundation),
      empty: !validYear(community.religiousSpaceYearFoundation),
    },
    { label: "Tipo", value: typeLabel(community.communityType) },
    { label: "Nação", value: capitalize(nation), dot: nation },
    {
      label: "Idioma",
      value: language ? capitalize(language) : "não informado",
      empty: !language,
    },
    {
      label: "Bairro",
      value: place.neighborhood || "não informado",
      empty: !place.neighborhood,
    },
    { label: "Cidade", value: place.city || "não informado", empty: !place.city },
    {
      label: "Recenseado em",
      value: formatDate(community.createdAt),
      empty: !community.createdAt,
    },
  ];
}

function NationDot({ nation }: { nation: string }) {
  return (
    <span
      className="nation-dot"
      aria-hidden="true"
      style={{ "--dot": `var(--n-${nationKey(nation)}, var(--map-dot))` } as CSSProperties}
    />
  );
}

/**
 * Ficha pública de uma comunidade — layout fiel ao mock (`renderDetail`):
 * crumbs, cabeçalho com tags, foto + texto, ficha do censo, mapa e
 * compartilhamento na lateral, e "Terreiros próximos" ao final.
 */
export function Community({ id, slug }: CommunityProps = {}) {
  const params = useParams<{ slug: string }>();
  const key = slug ?? params.slug ?? id ?? "";
  const [community, setCommunity] = useState<ReligiousCommunity | null>(null);
  const [all, setAll] = useState<ReligiousCommunity[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [reloadToken, setReloadToken] = useState(0);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (!key) {
      setStatus("missing");
      return;
    }
    let active = true;
    setStatus("loading");

    (async () => {
      const [byId, list] = await Promise.all([
        communitiesApi.getById(key).catch(() => null),
        communitiesApi.list().catch(() => [] as ReligiousCommunity[]),
      ]);
      if (!active) return;

      setAll(list);

      let resolved = byId;
      if (!resolved) {
        // URL por slug: o endpoint público consulta por id, então a lista
        // resolve o slug e a ficha completa é buscada pelo id encontrado.
        const match = list.find(
          (item) => item.slugify === key || item.id === key,
        );
        resolved = match
          ? await communitiesApi.getById(match.id).catch(() => null) ?? match
          : null;
        if (!active) return;
      }

      setCommunity(resolved);
      setStatus(resolved ? "ready" : "missing");
    })().catch(() => {
      if (active) setStatus("error");
    });

    return () => {
      active = false;
    };
  }, [key, reloadToken]);

  const related = useMemo(
    () => (community ? relatedCommunities(community, all) : []),
    [community, all],
  );

  const copyLink = useCallback(async () => {
    if (!community) return;
    const url = `${window.location.origin}/terreiro/${community.slugify ?? community.id}`;
    setCopyState((await copyToClipboard(url)) ? "copied" : "failed");
  }, [community]);

  useEffect(() => {
    if (copyState === "idle") return;
    const timer = window.setTimeout(() => setCopyState("idle"), 2600);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  // Ficha aberta: view_item com slug e nação (nunca o nome da liderança).
  useEffect(() => {
    if (status !== "ready" || !community) return;
    trackCommunityView(community);
  }, [status, community]);

  // Título/descrição únicos desta ficha (sem expor liderança ou endereço).
  useEffect(() => {
    if (status !== "ready" || !community) return;
    const place = communityPlace(community);
    applySeo(`/terreiro/${community.slugify ?? community.id}`, {
      title: `${community.religiousSpaceName} · Cadterreiros`,
      description: [
        community.religiousSpaceName,
        place.label ? `— ${place.label}` : "",
        community.religiousSpaceNation
          ? `· nação ${community.religiousSpaceNation}`
          : "",
      ]
        .filter(Boolean)
        .join(" ")
        .concat(". Ficha pública do censo de terreiros da Paraíba."),
    });
  }, [status, community]);

  if (status === "loading") {
    return (
      <main>
        <div className="shell page-body">
          <PageLoader label="Carregando ficha do terreiro" />
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main>
        <header className="page-head">
          <div className="shell">
            <p className="eyebrow">Acervo</p>
            <h1 className="display-1">Não foi possível carregar a ficha</h1>
            <p className="lede">
              A consulta ao acervo falhou. Verifique a conexão e tente
              novamente.
            </p>
            <p className="mt-6">
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setReloadToken((token) => token + 1)}
              >
                Tentar novamente
              </button>
            </p>
          </div>
        </header>
      </main>
    );
  }

  if (status === "missing" || !community) {
    return (
      <main>
        <header className="page-head">
          <div className="shell">
            <p className="eyebrow">Acervo</p>
            <h1 className="display-1">Terreiro não encontrado</h1>
            <p className="lede">
              Não encontramos esse registro no acervo. Ele pode ter sido movido
              ou o endereço está incompleto.
            </p>
            <p className="mt-6">
              <Link className="pill-link" to="/buscar">
                Voltar à busca <ArrowIcon />
              </Link>
            </p>
          </div>
        </header>
      </main>
    );
  }

  const photo = communityPhotoUrl(community);
  const name = community.religiousSpaceName;
  const year = community.religiousSpaceYearFoundation;
  const founded = validYear(year);
  const coordinates = coordinatesLabel(community.lat, community.long);
  const hasCoordinates =
    typeof community.lat === "number" && typeof community.long === "number";

  return (
    <main>
      <div className="shell page-body">
        <nav className="crumbs meta" aria-label="Trilha de navegação">
          <Link to="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link to="/buscar">Buscar</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{name}</span>
        </nav>

        <header className="detail__head">
          <p className="eyebrow">{typeLabel(community.communityType)}</p>
          <h1 className="display-1">{name}</h1>
          <p className="lede detail__place">
            {placeLabel(community)}
            {founded ? ` · Desde ${year}` : ""}
          </p>
          <div className="detail__tags">
            <span className="tag">
              <NationDot nation={community.religiousSpaceNation} />
              {capitalize(community.religiousSpaceNation)}
            </span>
            <span className="tag">{typeLabel(community.communityType)}</span>
            {founded ? (
              <span className="tag">Fundação em {year}</span>
            ) : (
              <span className="tag">Fundação não informada</span>
            )}
          </div>
        </header>

        <div className="detail__layout">
          <div>
            <figure className="detail__figure">
              {photo ? (
                <img
                  className="detail__photo"
                  src={photo}
                  alt={`Fotografia do terreiro ${name}`}
                />
              ) : (
                <div className="detail__photo detail__photo--none">
                  Sem fotografia no acervo
                </div>
              )}
              {photo ? (
                <figcaption className="meta figure-caption">
                  Fotografia do acervo do recenseamento.
                </figcaption>
              ) : null}
            </figure>

            <div className="article">
              <h2 className="display-3">Sobre esta comunidade</h2>
              <p className="bio">
                {community.bio
                  ? community.bio
                  : "Não informado no censo."}
              </p>

              <h2 className="display-3">Localização registrada</h2>
              <p>
                O ponto abaixo usa as coordenadas informadas no recenseamento. A
                ficha não substitui uma visita ou contato prévio com a
                comunidade.
              </p>
            </div>
          </div>

          <aside className="aside-stack">
            <div className="card card--pad">
              <p className="eyebrow">Ficha do censo</p>
              <dl className="deflist">
                {fichaRows(community).map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd className={row.empty ? "is-empty" : undefined}>
                      {row.dot ? (
                        <span className="deflist__value">
                          <NationDot nation={row.dot} />
                          {row.value}
                        </span>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card card--pad">
              <p className="eyebrow">No mapa</p>
              {hasCoordinates ? (
                <LeafletMap
                  communities={[community]}
                  className="mapbox mapbox--single"
                  height={240}
                  maxZoom={14}
                />
              ) : (
                <div className="map-empty">Localização não informada no censo.</div>
              )}
              <p className="meta detail__map">
                Coordenadas do censo: {coordinates}.
              </p>
            </div>

            <div className="card card--pad">
              <p className="eyebrow">Compartilhar</p>
              <div className="detail__actions">
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={copyLink}
                >
                  {copyState === "copied" ? "Link copiado" : "Copiar link da ficha"}
                </button>
                <Link className="btn btn--ghost" to="/buscar">
                  Voltar à busca
                </Link>
              </div>
              <p className="meta" role="status" aria-live="polite">
                {copyState === "failed"
                  ? "Não foi possível copiar. Use a barra de endereço do navegador."
                  : copyState === "copied"
                    ? "Link copiado para a área de transferência."
                    : ""}
              </p>
            </div>
          </aside>
        </div>

        <section className="related" aria-labelledby="relacionados-title">
          <div className="shead">
            <div className="shead__text">
              <p className="eyebrow">Continue explorando</p>
              <h2 className="display-2" id="relacionados-title">
                Terreiros próximos
              </h2>
              <p className="lede">
                Comunidades do mesmo bairro ou da mesma nação.
              </p>
            </div>
            <Link className="btn btn--ghost shead__link" to="/buscar">
              Ver todos <ArrowIcon />
            </Link>
          </div>

          {related.length > 0 ? (
            <div className="cardgrid">
              {related.map((item) => (
                <CommunityCard
                  key={item.id}
                  community={item}
                  href={`/terreiro/${item.slugify ?? item.id}`}
                  onClick={() => trackCommunitySelect(item, "related")}
                />
              ))}
            </div>
          ) : (
            <p className="lede">
              Ainda não há outros terreiros cadastrados nesta nação ou bairro.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default Community;
