import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CookieBanner from "../../../src/components/composed/CookieBanner";
import Footer from "../../../src/components/layout/Footer";
import { ConsentProvider } from "../../../src/features/analytics/ConsentProvider";
import {
  CONSENT_STORAGE_KEY,
  type ConsentStorage,
} from "../../../src/features/analytics/consent";
import { bootstrapAnalytics } from "../../../src/features/analytics/ga";

vi.mock("../../../src/features/analytics/ga", () => ({
  bootstrapAnalytics: vi.fn(),
  trackPageView: vi.fn(),
}));

function memoryStorage(): ConsentStorage & { data: Record<string, string> } {
  const data: Record<string, string> = {};
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

function renderConsent(storage = memoryStorage()) {
  const view = render(
    <MemoryRouter>
      <ConsentProvider storage={storage}>
        <CookieBanner />
        <Footer />
      </ConsentProvider>
    </MemoryRouter>,
  );
  return { ...view, storage };
}

function stored(storage: { data: Record<string, string> }) {
  const raw = storage.data[CONSENT_STORAGE_KEY];
  return raw ? JSON.parse(raw) : null;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CookieBanner", () => {
  it("aparece na primeira visita e aceita todas as categorias", () => {
    const { storage } = renderConsent();

    expect(
      screen.getByRole("dialog", { name: "Cookies e privacidade" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Aceitar" }));

    expect(
      screen.queryByRole("dialog", { name: "Cookies e privacidade" }),
    ).not.toBeInTheDocument();
    expect(stored(storage)).toMatchObject({ analytics: true, version: 1 });
    expect(bootstrapAnalytics).toHaveBeenCalledWith(true);
  });

  it("rejeitar mantém somente o essencial e fecha o banner", () => {
    const { storage } = renderConsent();

    fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));

    expect(
      screen.queryByRole("dialog", { name: "Cookies e privacidade" }),
    ).not.toBeInTheDocument();
    expect(stored(storage)).toMatchObject({ analytics: false });
    expect(bootstrapAnalytics).toHaveBeenCalledWith(false);
  });

  it("personalizar permite salvar apenas os essenciais", () => {
    const { storage } = renderConsent();

    fireEvent.click(screen.getByRole("button", { name: "Personalizar" }));

    const essential = screen.getByRole("checkbox", {
      name: /Essenciais/,
    }) as HTMLInputElement;
    expect(essential).toBeChecked();
    expect(essential).toBeDisabled();

    const analytics = screen.getByRole("checkbox", {
      name: /Análises/,
    }) as HTMLInputElement;
    expect(analytics).toBeChecked();

    fireEvent.click(analytics);
    fireEvent.click(screen.getByRole("button", { name: "Salvar preferências" }));

    expect(stored(storage)).toMatchObject({ analytics: false });
    expect(
      screen.queryByRole("dialog", { name: "Cookies e privacidade" }),
    ).not.toBeInTheDocument();
  });

  it("não aparece quando já existe uma escolha salva", () => {
    const storage = memoryStorage();
    storage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        analytics: true,
        updatedAt: "2026-10-28T00:00:00.000Z",
      }),
    );

    renderConsent(storage);

    expect(
      screen.queryByRole("dialog", { name: "Cookies e privacidade" }),
    ).not.toBeInTheDocument();
    expect(bootstrapAnalytics).toHaveBeenCalledWith(true);
  });

  it("ao reabrir depois de rejeitar, a análise nasce desmarcada", () => {
    renderConsent();

    fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Preferências de cookies" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Personalizar" }));

    expect(
      screen.getByRole("checkbox", { name: /Análises/ }),
    ).not.toBeChecked();
  });

  it("o rodapé reabre as preferências com a escolha atual", () => {
    const storage = memoryStorage();
    storage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        analytics: true,
        updatedAt: "2026-10-28T00:00:00.000Z",
      }),
    );
    renderConsent(storage);

    fireEvent.click(
      screen.getByRole("button", { name: "Preferências de cookies" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Personalizar" }));

    expect(
      screen.getByRole("checkbox", { name: /Análises/ }),
    ).toBeChecked();
  });
});
