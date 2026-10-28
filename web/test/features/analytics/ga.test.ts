import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type GaModule = typeof import("../../../src/features/analytics/ga");

function gaScript(): HTMLScriptElement | null {
  return document.head.querySelector<HTMLScriptElement>(
    "script[data-cadterreiros-ga]",
  );
}

function commands(): unknown[][] {
  return (window.dataLayer ?? []).map((entry) =>
    Array.from(entry as ArrayLike<unknown>),
  );
}

function events(name: string): unknown[][] {
  return commands().filter((entry) => entry[0] === "event" && entry[1] === name);
}

async function loadGa(gaId = ""): Promise<GaModule> {
  vi.resetModules();
  vi.stubEnv("VITE_GA_ID", gaId);
  return import("../../../src/features/analytics/ga");
}

beforeEach(() => {
  gaScript()?.remove();
  window.dataLayer = [];
  delete window.gtag;
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("bootstrapAnalytics", () => {
  it("não carrega terceiros antes do aceite e nasce com analytics negado", async () => {
    const ga = await loadGa("G-TESTE");

    ga.bootstrapAnalytics(false);

    expect(gaScript()).toBeNull();
    expect(commands()[0]).toEqual([
      "consent",
      "default",
      expect.objectContaining({ analytics_storage: "denied" }),
    ]);
    expect(commands().at(-1)).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "denied" }),
    ]);
    expect(ga.isAnalyticsActive()).toBe(false);
  });

  it("injeta o gtag.js só depois do aceite, com o ID configurado", async () => {
    const ga = await loadGa("G-TESTE");

    ga.bootstrapAnalytics(true);

    expect(gaScript()?.src).toContain("id=G-TESTE");
    expect(commands()).toContainEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted" }),
    ]);
    expect(commands()).toContainEqual([
      "config",
      "G-TESTE",
      expect.objectContaining({ send_page_view: false }),
    ]);
    expect(ga.isAnalyticsActive()).toBe(true);
  });

  it("usa o ID do app antigo quando o ambiente não configura nada", async () => {
    const ga = await loadGa("");

    ga.bootstrapAnalytics(true);

    expect(gaScript()?.src).toContain("G-CCSQS7ZTT2");
  });

  it("é idempotente: um script e uma configuração por sessão", async () => {
    const ga = await loadGa("G-TESTE");

    ga.bootstrapAnalytics(true);
    ga.bootstrapAnalytics(true);

    expect(document.querySelectorAll("script[data-cadterreiros-ga]")).toHaveLength(1);
    expect(commands().filter((entry) => entry[0] === "config")).toHaveLength(1);
    expect(commands().filter((entry) => entry[1] === "default")).toHaveLength(1);
  });

  it("revogar o consentimento desliga o envio sem remover o script já carregado", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);

    ga.bootstrapAnalytics(false);

    expect(ga.isAnalyticsActive()).toBe(false);
    expect(commands().at(-1)).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "denied" }),
    ]);
  });
});

describe("trackPageView", () => {
  it("não envia nada sem consentimento", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(false);

    ga.trackPageView("/buscar");

    expect(events("page_view")).toHaveLength(0);
  });

  it("envia page_view manual nas rotas públicas", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);

    ga.trackPageView("/buscar");

    expect(events("page_view")).toHaveLength(1);
    expect(events("page_view")[0][2]).toMatchObject({ page_path: "/buscar" });
  });

  it("ignora rotas privadas mesmo com consentimento", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);

    for (const path of ["/admin", "/admin/cadastros/1", "/entrar", "/otp/a/b"]) {
      ga.trackPageView(path);
    }

    expect(events("page_view")).toHaveLength(0);
  });
});

describe("trackEvent", () => {
  it("não envia eventos antes do aceite", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(false);

    ga.trackEvent("search", { search_term: "ketu", results: 1 });

    // Só as três instruções de bootstrap (default, js, update); nenhum evento.
    expect(commands().filter((entry) => entry[0] === "event")).toHaveLength(0);
  });

  it("envia eventos permitidos com parâmetros limpos", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);

    ga.trackEvent("search", { search_term: "ketu", results: 3 });

    expect(events("search")[0][2]).toEqual({ search_term: "ketu", results: 3 });
  });

  it("descarta chaves e valores com dado pessoal", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);

    ga.trackEvent("search", {
      search_term: "ketu",
      email: "curadoria@cciao.org",
      phone: "83999998888",
      leader_name: "Mãe Ana",
      note: "falar com curadoria@cciao.org",
      address: "Rua 1",
      safe_count: 2,
    });

    expect(events("search")[0][2]).toEqual({
      search_term: "ketu",
      safe_count: 2,
    });
  });

  it("ignora nomes de evento fora da lista", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);

    ga.trackEvent("purchase" as never, { value: 10 });

    expect(commands().filter((entry) => entry[0] === "event")).toHaveLength(0);
  });

  it("não envia evento disparado em rota privada", async () => {
    const ga = await loadGa("G-TESTE");
    ga.bootstrapAnalytics(true);
    window.history.pushState({}, "", "/admin");
    try {
      ga.trackEvent("view_item", { item_id: "x" });
      expect(commands().filter((entry) => entry[0] === "event")).toHaveLength(0);
    } finally {
      window.history.pushState({}, "", "/");
    }
  });
});

describe("sanitizeParams", () => {
  it("limpa objetos aninhados e remove itens vazios", async () => {
    const ga = await loadGa("G-TESTE");

    const clean = ga.sanitizeParams({
      city: "João Pessoa",
      items: [{ item_id: "ile-ase", leader_name: "Mãe Ana" }],
      empty: undefined,
      long: "x".repeat(200),
    });

    expect(clean).toEqual({
      city: "João Pessoa",
      items: [{ item_id: "ile-ase" }],
    });
  });
});
