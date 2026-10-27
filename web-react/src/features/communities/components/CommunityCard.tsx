import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { ReligiousCommunity } from "../../../domain/types";
import ArrowIcon from "../../../components/ui/ArrowIcon";
import cadLogo from "../../../assets/img/logos/cad.logo.svg";

/** URL base do CDN de fotografias das comunidades (VITE_IMG_RELIGIOUS_COMMUNITY_URL). */
const CDN_BASE = import.meta.env.VITE_IMG_RELIGIOUS_COMMUNITY_URL ?? "";

/**
 * Monta a URL absoluta da fotografia principal. O DTO público devolve um
 * caminho relativo (ex.: `/religiousCommunities/xxx.jpg`) ou uma URL completa.
 */
function communityPhotoUrl(community: ReligiousCommunity): string | null {
  const picture = community.religiousSpaceMainPicture;
  if (!picture) return null;
  if (/^https?:\/\//i.test(picture) || !CDN_BASE) return picture;
  const base = CDN_BASE.replace(/\/+$/, "");
  // O caminho pode repetir o sufixo do CDN (`/religiousCommunities/x.jpg`) — evita duplicar.
  const suffix = base.replace(/^https?:\/\/[^/]+/i, "");
  const path = suffix && picture.startsWith(suffix)
    ? picture.slice(suffix.length)
    : picture;
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** Converte a nação na chave do token de cor `--n-*` (sem acentos, kebab-case). */
function nationKey(nation: string): string {
  return nation
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Extrai bairro e cidade, tolerando o DTO achatado (apenas `fullAddress`). */
function communityPlace(community: ReligiousCommunity): {
  neighborhood: string;
  city: string;
  label: string;
} {
  const address = community.communityAddress;
  if (address?.neighborhood || address?.city) {
    const neighborhood = address.neighborhood ?? "";
    const city = address.city ?? "";
    return { neighborhood, city, label: [neighborhood, city].filter(Boolean).join(", ") };
  }
  const parts = (community.fullAddress ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  // Formato esperado: `Bairro, Cidade, UF`.
  const neighborhood = parts.length >= 2 ? parts[0] : "";
  const city = parts.length >= 2 ? parts[1] : parts[0] ?? "";
  return { neighborhood, city, label: [neighborhood, city].filter(Boolean).join(", ") };
}

export interface CommunityCardProps {
  community: ReligiousCommunity;
  onClick?: (community: ReligiousCommunity) => void;
  /** Quando informado, o card renderiza como link de rota em vez de botão. */
  href?: string;
}

export function CommunityCard({ community, onClick, href }: CommunityCardProps) {
  const photo = communityPhotoUrl(community);
  const place = communityPlace(community);
  const name = community.religiousSpaceName;
  const nation = community.religiousSpaceNation;
  const type = community.communityType;
  const year = community.religiousSpaceYearFoundation;

  const body = (
    <>
      {photo ? (
        <img className="tcard__photo" src={photo} alt={`Fotografia do terreiro ${name}`} loading="lazy" />
      ) : (
        <div className="tcard__photo tcard__photo--none">
          <img className="tcard__photo-mark" src={cadLogo} alt="" width={56} height={56} />
          <span className="tcard__photo-label">Sem Fotografia</span>
        </div>
      )}
      <div className="tcard__body">
        <h3 className="tcard__name" title={name}>
          {name}
        </h3>
        <p className="tcard__place" title={place.label}>
          {place.label}
        </p>
        <div className="tcard__tags">
          {nation ? (
            <span className="tag">
              <span
                className="nation-dot"
                aria-hidden="true"
                style={
                  {
                    "--dot": `var(--n-${nationKey(nation)}, var(--map-dot))`,
                  } as CSSProperties
                }
              />
              {nation}
            </span>
          ) : null}
          {type ? <span className="tag">{type}</span> : null}
          {year ? <span className="tag">Desde {year}</span> : null}
        </div>
        <span className="tcard__foot">
          Abrir ficha <ArrowIcon size={14} />
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <Link className="tcard" to={href} onClick={() => onClick?.(community)} aria-label={name}>
        {body}
      </Link>
    );
  }

  return (
    <button type="button" className="tcard" onClick={() => onClick?.(community)} aria-label={name}>
      {body}
    </button>
  );
}

export default CommunityCard;
