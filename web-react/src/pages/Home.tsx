import { useEffect, useState } from "react";
import { communitiesApi } from "../api/communities";
import CommunityCard from "../features/communities/components/CommunityCard";
import type { ReligiousCommunity } from "../domain/types";

export function Home() {
  const [oldest, setOldest] = useState<ReligiousCommunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    communitiesApi
      .oldest()
      .then((data) => {
        if (active) setOldest(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <section className="hero">
        <h1>Mapa dos Terreiros</h1>
        <p>Mapeamento de terreiros de matriz africana da Região Metropolitana de João Pessoa.</p>
      </section>

      <section className="stats">
        <div className="stats__grid">
          <div className="stat">
            <strong>{oldest.length}</strong>
            <span>mais antigos</span>
          </div>
        </div>
      </section>

      <section>
        <div className="shead">
          <h2>Os 9 mais antigos</h2>
        </div>
        <div className="cardgrid">
          {loading ? (
            <p>Carregando…</p>
          ) : (
            oldest.map((c) => <CommunityCard key={c.id} community={c} />)
          )}
        </div>
      </section>

      <section>
        <div className="shead">
          <h2>Mapeamento</h2>
        </div>
        <p>Explore os dados agregados dos terreiros cadastrados.</p>
      </section>
    </main>
  );
}

export default Home;
