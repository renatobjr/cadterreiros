import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Nav from "../../../src/components/layout/Nav";

describe("Nav", () => {
  it("renders brand and all main links", () => {
    render(<Nav />);
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
    render(<Nav />);
    const burger = screen.getByRole("button", { name: /abrir menu/i });
    expect(burger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(burger);
    expect(burger).toHaveAttribute("aria-expanded", "true");

    const drawer = screen.getByRole("navigation", { name: /navegação móvel/i });
    expect(within(drawer).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/");
  });
});
