import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { ReligiousCommunity } from "../../../domain/types";
import markerSimple from "../../../assets/img/marker.simple.svg";
import markerCluster from "../../../assets/img/marker.cluster.svg";

export interface LeafletMapProps {
  communities: ReligiousCommunity[];
  className?: string;
  height?: number;
  /** Zoom máximo ao enquadrar os pontos (útil na ficha de um único terreiro). */
  maxZoom?: number;
}

const DEFAULT_CENTER: L.LatLngTuple = [-7.1195, -34.8451];
const DEFAULT_ZOOM = 11;
const CLUSTER_RADIUS = 60;
const MARKER_SIZE = 40;

const toCssUrl = (url: string) => String(url).replace(/'/g, "%27");

/**
 * Mapa de terreiros seguindo fielmente o `CadMap.vue` do projeto original:
 * tile OSM, marcador próprio (`marker.simple.svg`) e cluster com contador
 * (`marker.cluster.svg`), `ResizeObserver` e `fitBounds`.
 */
export function LeafletMap({
  communities,
  className,
  height = 460,
  maxZoom = DEFAULT_ZOOM,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const markerLayer = L.markerClusterGroup({
      maxClusterRadius: CLUSTER_RADIUS,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<div class="cad-cluster-icon" style="background-image: url('${toCssUrl(
            markerCluster,
          )}')"><span>${cluster.getChildCount()}</span></div>`,
          className: "cad-cluster-wrapper",
          iconSize: [MARKER_SIZE, MARKER_SIZE],
        }),
    });

    map.addLayer(markerLayer);

    mapRef.current = map;
    layerRef.current = markerLayer;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const markerLayer = layerRef.current;
    const map = mapRef.current;
    if (!markerLayer || !map) return;

    markerLayer.clearLayers();

    const points = communities.filter(
      (c) =>
        typeof c.lat === "number" &&
        typeof c.long === "number" &&
        Number.isFinite(c.lat) &&
        Number.isFinite(c.long),
    );

    points.forEach((c) => {
      const marker = L.marker([c.lat as number, c.long as number], {
        icon: L.divIcon({
          html: `<img src="${toCssUrl(markerSimple)}" width="${MARKER_SIZE}" height="${MARKER_SIZE}" alt="" />`,
          className: "cad-marker-icon",
          iconSize: [MARKER_SIZE, MARKER_SIZE],
          iconAnchor: [MARKER_SIZE / 2, MARKER_SIZE],
        }),
        title: c.religiousSpaceName,
        bubblingMouseEvents: false,
      });
      marker.bindPopup(
        `<strong>${c.religiousSpaceName}</strong><br/>${c.communityAddress?.city ?? c.fullAddress ?? ""}`,
      );
      markerLayer.addLayer(marker);
    });

    const bounds = markerLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom });
    }
  }, [communities, maxZoom]);

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
