import "@testing-library/jest-dom";

/**
 * jsdom não implementa `ResizeObserver`, usado pelo `LeafletMap` para
 * invalidar o tamanho do mapa. O stub evita que a montagem do mapa quebre
 * a suíte; nenhum teste depende do comportamento de resize.
 */
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverStub {
    observe() {}

    unobserve() {}

    disconnect() {}
  }

  globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}
