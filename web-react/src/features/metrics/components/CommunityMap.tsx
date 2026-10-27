import type { ReligiousCommunity } from "../../../domain/types";

export interface CommunityMapProps {
  communities: ReligiousCommunity[];
}

const NATION_COLOR: Record<string, string> = {
  umbanda: "var(--n-umbanda)",
  nagô: "var(--n-nago)",
  ketu: "var(--n-ketu)",
  outros: "var(--n-outros)",
  angola: "var(--n-angola)",
  jeje: "var(--n-jeje)",
  "ekiti efon": "var(--n-ekiti-efon)",
  quimbanda: "var(--n-quimbanda)",
};

const W = 800;
const H = 450;
const PAD = 40;

/**
 * Mapa esquemático (SVG) dos terreiros: projeta lat/long no viewBox.
 * É a leitura territorial do censo, não um mapa de ruas.
 */
export function CommunityMap({ communities }: CommunityMapProps) {
  const points = communities.filter(
    (c) =>
      typeof c.lat === "number" &&
      typeof c.long === "number" &&
      Number.isFinite(c.lat) &&
      Number.isFinite(c.long),
  );

  if (points.length === 0) {
    return (
      <div className="mapbox" role="region" aria-label="Mapa">
        <div className="mapbox__grid" />
      </div>
    );
  }

  const lats = points.map((p) => p.lat as number);
  const longs = points.map((p) => p.long as number);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLong = Math.min(...longs);
  const maxLong = Math.max(...longs);
  const spanLat = maxLat - minLat || 1;
  const spanLong = maxLong - minLong || 1;

  const project = (lat: number, long: number) => {
    const x = PAD + ((long - minLong) / spanLong) * (W - PAD * 2);
    const y = H - PAD - ((lat - minLat) / spanLat) * (H - PAD * 2);
    return { x, y };
  };

  return (
    <div className="mapbox" role="region" aria-label="Mapa">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Mapa esquemático com ${points.length} terreiros`}
      >
        <g className="mapbox__grid">
          {Array.from({ length: 9 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={PAD + (i * (W - PAD * 2)) / 8}
              y1={PAD}
              x2={PAD + (i * (W - PAD * 2)) / 8}
              y2={H - PAD}
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={PAD}
              y1={PAD + (i * (H - PAD * 2)) / 5}
              x2={W - PAD}
              y2={PAD + (i * (H - PAD * 2)) / 5}
            />
          ))}
        </g>
        {points.map((c) => {
          const { x, y } = project(c.lat as number, c.long as number);
          const color = NATION_COLOR[c.religiousSpaceNation] ?? "var(--map-dot)";
          return (
            <circle
              key={c.id}
              className="mapbox__pin"
              cx={x}
              cy={y}
              r={6}
              fill={color}
              stroke="var(--surface)"
              strokeWidth={1.5}
            >
              <title>{c.religiousSpaceName}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

export default CommunityMap;
