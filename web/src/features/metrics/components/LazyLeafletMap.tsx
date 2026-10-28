import { lazy, Suspense } from "react";
import PageLoader from "../../../components/composed/PageLoader";
import type { LeafletMapProps } from "./LeafletMap";

/* Leaflet pesa ~180 kB e só é necessário quando há um mapa na tela. O
   carregamento sob demanda tira a biblioteca do caminho crítico das páginas
   sem mapa (busca, artigos, sobre, cadastro). */
const LeafletMap = lazy(() => import("./LeafletMap"));

export function LazyLeafletMap(props: LeafletMapProps) {
  return (
    <Suspense fallback={<PageLoader compact label="Carregando mapa" />}>
      <LeafletMap {...props} />
    </Suspense>
  );
}

export default LazyLeafletMap;
