import { describe, expect, it } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  clearConsent,
  isTrackablePath,
  parseConsent,
  readConsent,
  writeConsent,
  type ConsentStorage,
} from "../../../src/features/analytics/consent";

function memoryStorage(initial: Record<string, string> = {}): ConsentStorage & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

describe("isTrackablePath", () => {
  it("libera as rotas públicas", () => {
    for (const path of [
      "/",
      "/buscar",
      "/terreiro/ile-ase",
      "/mapeamento",
      "/artigos",
      "/sobre-o-projeto",
      "/cadastro-voluntario",
    ]) {
      expect(isTrackablePath(path)).toBe(true);
    }
  });

  it("bloqueia painel, autenticação e design system", () => {
    for (const path of [
      "/admin",
      "/admin/",
      "/admin/cadastros/123",
      "/entrar",
      "/esqueci-minha-senha",
      "/primeiro-acesso",
      "/otp/token/email",
      "/set-password/token",
      "/design-system",
    ]) {
      expect(isTrackablePath(path)).toBe(false);
    }
  });

  it("não bloqueia rotas que apenas começam com a mesma palavra", () => {
    expect(isTrackablePath("/administracao")).toBe(true);
    expect(isTrackablePath("/entrar-no-projeto")).toBe(true);
  });

  it("tolera query, hash e barra final", () => {
    expect(isTrackablePath("/buscar?q=ketu#topo")).toBe(true);
    expect(isTrackablePath("/admin/?tab=usuarios")).toBe(false);
  });

  it("trata caminho vazio como não rastreável", () => {
    expect(isTrackablePath("")).toBe(false);
  });
});

describe("consentimento persistido", () => {
  it("grava e lê a escolha com versão e data", () => {
    const storage = memoryStorage();
    const now = new Date("2026-10-28T12:00:00.000Z");

    const state = writeConsent({ analytics: true }, storage, now);

    expect(state).toEqual({
      version: 1,
      analytics: true,
      updatedAt: "2026-10-28T12:00:00.000Z",
    });
    expect(readConsent(storage)).toEqual(state);
    expect(storage.data[CONSENT_STORAGE_KEY]).toContain('"analytics":true');
  });

  it("ignora formato inválido em vez de quebrar a página", () => {
    expect(parseConsent("{")).toBeNull();
    expect(parseConsent("null")).toBeNull();
    expect(parseConsent('{"analytics":"sim"}')).toBeNull();
    expect(parseConsent('{"analytics":false}')).toEqual({
      version: 1,
      analytics: false,
      updatedAt: "",
    });
  });

  it("remove a escolha quando solicitado", () => {
    const storage = memoryStorage();
    writeConsent({ analytics: false }, storage);
    clearConsent(storage);

    expect(readConsent(storage)).toBeNull();
  });

  it("sobrevive a um storage que lança erro (modo privado)", () => {
    const broken: ConsentStorage = {
      getItem: () => {
        throw new Error("bloqueado");
      },
      setItem: () => {
        throw new Error("bloqueado");
      },
      removeItem: () => {
        throw new Error("bloqueado");
      },
    };

    expect(readConsent(broken)).toBeNull();
    expect(() => writeConsent({ analytics: true }, broken)).not.toThrow();
    expect(() => clearConsent(broken)).not.toThrow();
  });
});
