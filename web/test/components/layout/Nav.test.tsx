import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Nav from "../../../src/components/layout/Nav";
import { AuthProvider } from "../../../src/features/auth/AuthProvider";

const renderNav = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Nav />
      </AuthProvider>
    </MemoryRouter>,
  );

describe("Nav", () => {
  it("renders brand and all main links", async () => {
    renderNav();
    // Enquanto a sessão é validada, o link de conta é um placeholder.
    await waitFor(
      () =>
        expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument(),
      { timeout: 3000 },
    );
    const nav = within(screen.getByRole("banner"));
    expect(nav.getByRole("link", { name: /cadterreiros, início/i })).toBeInTheDocument();

    const links = [
      ["Início", "/"],
      ["Buscar", "/buscar"],
      ["Mapeamento", "/mapeamento"],
      ["Artigos", "/artigos"],
      ["Sobre o projeto", "/sobre-o-projeto"],
      ["Cadastro voluntário", "/cadastro-voluntario"],
      ["Entrar", "/entrar"],
    ] as const;

    for (const [name, href] of links) {
      expect(nav.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("toggles drawer on burger click", () => {
    renderNav();
    const burger = screen.getByRole("button", { name: /abrir menu/i });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "true");

    const drawer = screen.getByRole("navigation", { name: /navegação móvel/i });
    expect(within(drawer).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
  });
});
