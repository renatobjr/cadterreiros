<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import cadMarkerSimple from "@/assets/svg/marker.simple.svg";
import cadMarkerCluster from "@/assets/svg/marker.cluster.svg";

const props = defineProps({
  center: {
    type: Object,
    default: () => ({ lat: -7.1195, lng: -34.8451 }),
  },
  zoom: {
    type: Number,
    default: 13,
  },
  markers: {
    type: Array,
    default: () => [],
  },
  cluster: {
    type: Boolean,
    default: false,
  },
  clusterRadius: {
    type: Number,
    default: 60,
  },
  fit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["map-click", "marker-click"]);

const mapElement = ref(null);

let map = null;
let markerLayer = null;
let resizeObserver = null;

const DEFAULT_CENTER = { lat: -7.1195, lng: -34.8451 };

const toCssUrl = (url) => String(url).replace(/'/g, "%27");

const parseCenter = (center) => {
  const lat = parseFloat(center?.lat);
  const lng = parseFloat(center?.lng);

  return Number.isFinite(lat) && Number.isFinite(lng)
    ? { lat, lng }
    : DEFAULT_CENTER;
};

const createMap = () => {
  const start = parseCenter(props.center);

  map = L.map(mapElement.value).setView([start.lat, start.lng], props.zoom);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  markerLayer = props.cluster
    ? L.markerClusterGroup({
        maxClusterRadius: props.clusterRadius,
        iconCreateFunction: (cluster) =>
          L.divIcon({
            html: `<div class="cad-cluster-icon" style="background-image: url('${toCssUrl(
              cadMarkerCluster
            )}')"><span>${cluster.getChildCount()}</span></div>`,
            className: "cad-cluster-wrapper",
            iconSize: [40, 40],
          }),
      })
    : L.layerGroup();

  map.addLayer(markerLayer);

  map.on("click", (event) =>
    emit("map-click", { lat: event.latlng.lat, lng: event.latlng.lng })
  );

  renderMarkers();
  fitToMarkers();

  resizeObserver = new ResizeObserver(() => map?.invalidateSize());
  resizeObserver.observe(mapElement.value);
};

const fitToMarkers = () => {
  if (!map || !props.fit || !markerLayer) return;

  const bounds =
    typeof markerLayer.getBounds === "function" ? markerLayer.getBounds() : null;

  if (bounds?.isValid()) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: props.zoom });
  }
};

const renderMarkers = () => {
  if (!markerLayer) return;

  markerLayer.clearLayers();

  props.markers.forEach((marker) => {
    const lat = parseFloat(marker.lat);
    const lng = parseFloat(marker.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const leafletMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<img src="${toCssUrl(cadMarkerSimple)}" width="40" height="40" alt="" />`,
        className: "cad-marker-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      }),
      title: marker.title || "",
      bubblingMouseEvents: false,
    });

    leafletMarker.on("click", () => emit("marker-click", marker));
    markerLayer.addLayer(leafletMarker);
  });
};

watch(
  () => props.center,
  (center) => {
    if (!map || !center || props.fit) return;

    const lat = parseFloat(center.lat);
    const lng = parseFloat(center.lng);

    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng], map.getZoom());
    }
  },
  { deep: true }
);

watch(
  () => props.markers,
  () => {
    renderMarkers();
    fitToMarkers();
  },
  { deep: true }
);

onMounted(() => {
  createMap();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  map?.remove();
  map = null;
  markerLayer = null;
});
</script>

<template>
  <div ref="mapElement" class="cad-map"></div>
</template>

<style scoped>
.cad-map {
  height: 100%;
  width: 100%;
}
</style>

<style>
.cad-marker-icon {
  background: transparent;
  border: none;
}

.cad-cluster-wrapper {
  background: transparent;
  border: none;
}

.cad-cluster-icon {
  align-items: center;
  background-size: cover;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  font-size: 14px;
  font-weight: 700;
  height: 40px;
  justify-content: center;
  width: 40px;
}
</style>
