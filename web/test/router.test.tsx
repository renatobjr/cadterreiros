import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { routes } from "../src/router";
import { AuthProvider } from "../src/features/auth/AuthProvider";
import { ConsentProvider } from "../src/features/analytics/ConsentProvider";

// As páginas de busca e de terreiro consultam a API no mount; o teste de
// roteamento não deve depender de rede.
vi.mock("../src/api/communities", () => {
  const communitiesApi = {
    list: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    statsSummary: vi.fn().mockResolvedValue({
      totalReligiousCommunities: 1,
      totalCities: 1,
      totalNeighborhoods: 1,
    }),
  };
  return { communitiesApi, default: communitiesApi };
});

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <ConsentProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ConsentProvider>,
  );
}

describe("router", () => {
  it("declara todas as rotas do AGENT.md §3 dentro do Layout", () => {
    const paths = (routes[0].children ?? []).map((route) => route.path);

    expect(paths).toEqual(
      expect.arrayContaining([
        "/",
        "/buscar",
        "/terreiro/:slug",
        "/mapeamento",
        "/artigos",
        "/artigos/:slug",
        "/sobre-o-projeto",
        "/sobre-a-cciao",
        "/cadastro-voluntario",
        "/entrar",
        "/esqueci-minha-senha",
        "/primeiro-acesso",
        "/otp/:token/:email",
        "/set-password/:token",
        "/design-system",
      ]),
    );
  });

  it("renderiza as rotas dentro de Nav e Footer", () => {
    renderRoute("/sobre-a-cciao");

    expect(
      screen.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Casa de Cultura Ilê Asé D'Osoguian/i,
      }),
    ).toBeInTheDocument();
  });

  it.each([
    ["/entrar", /Entrar no painel/],
    ["/esqueci-minha-senha", /Recuperar senha/],
    ["/primeiro-acesso", /Configurar acesso/],
    ["/otp/token-123/email%40teste.com", /Confira seu e-mail/],
    ["/set-password/token-123", /Criar nova senha/],
  ])("renderiza a página real de auth em %s", async (path, heading) => {
    renderRoute(path);

    expect(
      await screen.findByRole("heading", { level: 1, name: heading }),
    ).toBeInTheDocument();
  });

  it("renderiza as páginas de conteúdo e a referência interna", () => {
    const { unmount } = renderRoute("/artigos");
    expect(
      screen.getByRole("heading", { level: 1, name: "Artigos" }),
    ).toBeInTheDocument();
    unmount();

    renderRoute("/artigos/comunidades-tradicionais");
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "O que são Comunidades Tradicionais?",
      }),
    ).toBeInTheDocument();
  });

  it("renderiza a página do design system", () => {
    renderRoute("/design-system");

    expect(
      screen.getByRole("heading", { level: 1, name: "Design system" }),
    ).toBeInTheDocument();
  });

  it("redireciona /busca para /buscar", async () => {
    renderRoute("/busca");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Buscar um terreiro" }),
    ).toBeInTheDocument();
  });

  it("redireciona /login para /entrar", async () => {
    renderRoute("/login");

    expect(
      await screen.findByRole("heading", { level: 1, name: "Entrar no painel" }),
    ).toBeInTheDocument();
  });

  it("redireciona o endereço legado /:id/:slug para /terreiro/:slug", async () => {
    renderRoute("/12/terreiro-legado");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Terreiro não encontrado",
      }),
    ).toBeInTheDocument();
  });

  it.each([
    [
      "/o-que-sao-comunidades-tradicionais",
      "O que são Comunidades Tradicionais?",
    ],
    ["/quais-as-linguagens-do-candomble", "Quais as linguagens do Candomblé?"],
    [
      "/quais-as-nacoes-do-candomble-no-brasil",
      "Quais as nações do Candomblé no Brasil?",
    ],
  ])("redireciona a FAQ legada %s para o artigo", (path, title) => {
    renderRoute(path);

    expect(
      screen.getByRole("heading", { level: 1, name: title }),
    ).toBeInTheDocument();
  });

  it("mostra 404 para rotas inexistentes", () => {
    renderRoute("/rota-inexistente");

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Página não encontrada",
      }),
    ).toBeInTheDocument();
  });
});
