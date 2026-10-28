import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  canonicalForPath,
  descriptionForPath,
  isIndexablePath,
  titleForPath,
  useDocumentSeo,
} from "../../src/utils/seo";

describe("titleForPath", () => {
  it("dá nome próprio à home", () => {
    expect(titleForPath("/")).toBe(
      "Cadterreiros — acervo de terreiros de matriz africana",
    );
  });

  it("sufixa as rotas conhecidas com a marca", () => {
    expect(titleForPath("/buscar")).toBe("Buscar um terreiro · Cadterreiros");
    expect(titleForPath("/mapeamento")).toBe(
      "Mapeamento dos terreiros · Cadterreiros",
    );
    expect(titleForPath("/admin/usuarios")).toBe("Equipe (painel) · Cadterreiros");
  });

  it("resolve rotas dinâmicas", () => {
    expect(titleForPath("/terreiro/ile-ase")).toBe(
      "Ficha do terreiro · Cadterreiros",
    );
    expect(titleForPath("/artigos/nacoes-do-candomble")).toBe(
      "Artigo · Cadterreiros",
    );
  });

  it("tolera barra final, query e hash", () => {
    expect(titleForPath("/buscar/?q=ketu#topo")).toBe(
      "Buscar um terreiro · Cadterreiros",
    );
  });

  it("usa o fallback para rotas desconhecidas", () => {
    expect(titleForPath("/qualquer-coisa")).toBe(
      "Página não encontrada · Cadterreiros",
    );
  });
});

describe("descrição e indexação", () => {
  it("dá descrições específicas por rota", () => {
    expect(descriptionForPath("/buscar")).toMatch(/Pesquise terreiros/);
    expect(descriptionForPath("/mapeamento")).toMatch(/mapa/);
    expect(descriptionForPath("/terreiro/ile-ase")).toMatch(/censo/);
    expect(descriptionForPath("/qualquer")).toMatch(/Acervo do cadastramento/);
  });

  it("marca rotas privadas como não indexáveis", () => {
    for (const path of ["/admin", "/admin/cadastros/1", "/entrar", "/otp/a/b"]) {
      expect(isIndexablePath(path)).toBe(false);
    }
    expect(isIndexablePath("/")).toBe(true);
    expect(isIndexablePath("/terreiro/ile-ase")).toBe(true);
  });

  it("monta o canonical sem query/hash", () => {
    expect(canonicalForPath("/buscar/?q=ketu#topo")).toBe(
      "https://cadterreiros.cciao.org/buscar",
    );
  });
});

describe("useDocumentSeo", () => {
  it("aplica título, description, canonical e robots", () => {
    renderHook(() => useDocumentSeo("/mapeamento"));

    expect(document.title).toBe("Mapeamento dos terreiros · Cadterreiros");
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
    ).toMatch(/mapa/);
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    ).toBe("https://cadterreiros.cciao.org/mapeamento");
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toBe("index,follow");
    expect(
      document.querySelector('meta[property="og:url"]')?.getAttribute("content"),
    ).toBe("https://cadterreiros.cciao.org/mapeamento");
  });

  it("aplica noindex no painel", () => {
    renderHook(() => useDocumentSeo("/admin"));

    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toBe("noindex,nofollow");
  });
});
