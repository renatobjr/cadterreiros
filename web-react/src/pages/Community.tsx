import { useEffect, useState } from "react";
import { communitiesApi } from "../api/communities";
import type { ReligiousCommunity } from "../domain/types";

export interface CommunityProps {
  id?: string;
}

export function Community({ id = "1" }: CommunityProps = {}) {
  const [community, setCommunity] = useState<ReligiousCommunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    communitiesApi
      .getById(id)
      .then((data) => {
        if (active) setCommunity(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <main><p>Carregando…</p></main>;
  if (!community) return <main><p>Não encontrado.</p></main>;

  return (
    <main className="detail">
      <div className="detail__head">
        <h1>{community.religiousSpaceName}</h1>
      </div>
      <div className="detail__layout">
        <div className="detail__photo">
          {community.religiousSpaceMainPicture ? (
            <img src={community.religiousSpaceMainPicture} alt={community.religiousSpaceName} />
          ) : null}
        </div>
        <div className="detail__main">
          <p>{community.communityAddress?.fullAddress ?? community.fullAddress ?? "não informado"}</p>
          <p>{community.religiousSpaceLeaderName}</p>
        </div>
        <aside className="detail__aside">
          <p>{community.religiousSpaceNation}</p>
        </aside>
      </div>
    </main>
  );
}

export default Community;
