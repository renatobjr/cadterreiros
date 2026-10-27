import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { ReligiousCommunity } from "../../../domain/types";

export interface LeafletMapProps {
  communities: ReligiousCommunity[];
  className?: string;
  height?: number;
}

const NATION_COLOR: Record<string, string> = {
  umbanda: "#2f7d4a",
  nagô: "#8a6d2f",
  ketu: "#a23a2a",
  outros: "#6b5a4e",
  angola: "#367a52",
  jeje: "#2f5f8a",
  "ekiti efon": "#6a4a8a",
  quimbanda: "#8a2f2a",
};

const DEFAULT_CENTER: L.LatLngTuple = [-7.1195, -34.8451];

/**
 * Mapa real (Leaflet) dos terreiros recenseados. Cada ponto usa a cor da
 * nação; agrupa marcadores próximos. Renderizado apenas no cliente.
 */
export function LeafletMap({ communities, className, height = 460 }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const markers = L.markerClusterGroup({ maxClusterRadius: 50 });
    map.addLayer(markers);

    mapRef.current = map;
    layerRef.current = markers;

    const resize = () => map.invalidateSize();
    const timer = window.setTimeout(resize, 200);
    window.addEventListener("resize", resize);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", resize);
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const markers = layerRef.current;
    if (!markers) return;

    markers.clearLayers();

    const points = communities.filter(
      (c) =>
        typeof c.lat === "number" &&
        typeof c.long === "number" &&
        Number.isFinite(c.lat) &&
        Number.isFinite(c.long),
    );

    points.forEach((c) => {
      const color = NATION_COLOR[c.religiousSpaceNation] ?? "#6b5a4e";
      const icon = L.divIcon({
        className: "cad-map-marker",
        html: `<span style="display:block;width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.2)"></span>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const marker = L.marker([c.lat as number, c.long as number], { icon });
      marker.bindPopup(
        `<strong>${c.religiousSpaceName}</strong><br/>${c.communityAddress?.city ?? c.fullAddress ?? ""}`,
      );
      markers.addLayer(marker);
    });

    const map = mapRef.current;
    if (map && points.length > 0) {
      const bounds = L.latLngBounds(
        points.map((c) => [c.lat as number, c.long as number] as L.LatLngTuple),
      );
      map.fitBounds(bounds.pad(0.1), { maxZoom: 13 });
    }
  }, [communities]);

  return (
    <div
      className={className ?? "mapbox"}
      ref={containerRef}
      style={{ height, width: "100%" }}
      role="region"
      aria-label="Mapa dos terreiros"
    />
  );
}

export default LeafletMap;
