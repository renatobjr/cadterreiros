import type { ReligiousCommunity } from "../../../domain/types";

export interface CommunityCardProps {
  community: ReligiousCommunity;
  onClick?: (community: ReligiousCommunity) => void;
}

export function CommunityCard({ community, onClick }: CommunityCardProps) {
  const photo = community.religiousSpaceMainPicture;
  const place = `${community.communityAddress.city}, ${community.communityAddress.state}`;

  return (
    <button
      type="button"
      className="tcard"
      onClick={() => onClick?.(community)}
      aria-label={community.religiousSpaceName}
    >
      {photo ? (
        <img
          className="tcard__photo"
          src={photo}
          alt={community.religiousSpaceName}
        />
      ) : (
        <div className="tcard__photo tcard__photo--none">sem foto</div>
      )}
      <div className="tcard__body">
        <h3 className="tcard__name">{community.religiousSpaceName}</h3>
        <p className="tcard__place">{place}</p>
        <div className="tcard__tags">
          <span>{community.religiousSpaceNation}</span>
          <span>{community.communityType}</span>
        </div>
        <div className="tcard__foot">
          {community.religiousSpaceYearFoundation
            ? `fundado em ${community.religiousSpaceYearFoundation}`
            : "ano não informado"}
        </div>
      </div>
    </button>
  );
}

export default CommunityCard;