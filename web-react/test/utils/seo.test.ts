import { describe, expect, it } from "vitest";
import { titleForPath } from "../../src/utils/seo";

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
