import { render, screen, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Layout from "../../../src/components/layout/Layout";

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [{ path: "/", element: <p>Conteúdo da rota</p> }],
      },
    ],
    { initialEntries: ["/"] },
  );
  return render(<RouterProvider router={router} />);
}

describe("Layout", () => {
  it("renderiza Nav, conteúdo da rota e Footer", () => {
    renderLayout();
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo da rota")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("expõe os links principais no Nav", () => {
    renderLayout();
    const nav = within(screen.getByRole("banner"));
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

  it("renderiza as três colunas do Footer", () => {
    renderLayout();
    const footer = within(screen.getByRole("contentinfo"));
    expect(
      footer.getByRole("img", { name: "Casa de Cultura Ilê Asé D'Osoguian" }),
    ).toBeInTheDocument();
    expect(footer.getByText("Navegar")).toBeInTheDocument();
    expect(footer.getByText("Projeto")).toBeInTheDocument();
    expect(footer.getByRole("link", { name: "Sobre o projeto" })).toHaveAttribute(
      "href",
      "/sobre-o-projeto",
    );
  });
});
