import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { ReligiousCommunity } from "../../../domain/types";
import ArrowIcon from "../../../components/ui/ArrowIcon";
import cadLogo from "../../../assets/img/logos/cad.logo.svg";
import {
  capitalize,
  communityPhotoUrl,
  communityPlace,
  nationKey,
} from "../format";

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
              {capitalize(nation)}
            </span>
          ) : null}
          {type ? <span className="tag">{capitalize(type)}</span> : null}
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
