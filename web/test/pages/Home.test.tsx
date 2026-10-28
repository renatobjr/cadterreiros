import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { communitiesApi } from "../../src/api/communities";
import type { ReligiousCommunity } from "../../src/domain/types";
import Home from "../../src/pages/Home";

vi.mock("../../src/api/communities", () => ({
  communitiesApi: {
    statsSummary: vi.fn(),
    statsByPhotoCoverage: vi.fn(),
    statsByNation: vi.fn(),
    oldest: vi.fn(),
    list: vi.fn(),
  },
  default: {
    statsSummary: vi.fn(),
    statsByPhotoCoverage: vi.fn(),
    statsByNation: vi.fn(),
    oldest: vi.fn(),
    list: vi.fn(),
  },
}));

const api = communitiesApi as unknown as {
  statsSummary: ReturnType<typeof vi.fn>;
  statsByPhotoCoverage: ReturnType<typeof vi.fn>;
  statsByNation: ReturnType<typeof vi.fn>;
  oldest: ReturnType<typeof vi.fn>;
  list: ReturnType<typeof vi.fn>;
};

const makeCommunity = (index: number): ReligiousCommunity => ({
  id: String(index),
  authorization: true,
  communityGoogleApiLocalization: { lat: 0, long: 0 },
  communityAddress: {
    fullAddress: "Rua X, 1, Bairro Y",
    street: "Rua X",
    number: "1",
    neighborhood: "Bairro Y",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
  communityType: "matriz africana",
  religiousSpaceYearFoundation: 1900 + index,
  religiousSpaceLeaderFoundation: "Fundador",
  religiousSpaceNation: "ketu",
  religiousSpacePraticalLanguages: "yoruba",
  religiousSpaceName: `Terreiro ${index}`,
  religiousSpaceLeaderName: "Liderança",
  religiousSpacePositionName: "Pai",
  religiousSpaceStartedBy: "Comunidade",
  religiousSpaceNameDateStartedBy: "Ano",
  leaderEthnicity: "não informado",
  leaderGender: "não informado",
  leaderEducationalLevel: "não informado",
  leaderSufferedRacism: false,
  religiousSpaceStatus: "active",
  censusStep: "approved",
  registeredVoluntarily: true,
  createdAt: "2020-01-01",
  updatedAt: "2020-01-01",
});

const NINE_OLDEST = Array.from({ length: 12 }, (_, index) => makeCommunity(index + 1));

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  );

const mockSuccess = () => {
  api.statsSummary.mockResolvedValue({
    totalReligiousCommunities: 214,
    totalCities: 5,
    totalNeighborhoods: 90,
  });
  api.statsByPhotoCoverage.mockResolvedValue({
    withPhoto: 199,
    withoutPhoto: 15,
    total: 214,
  });
  api.statsByNation.mockResolvedValue([
    { nation: "ketu", count: 120 },
    { nation: "angola", count: 60 },
    { nation: "jege", count: 34 },
  ]);
  api.oldest.mockResolvedValue(NINE_OLDEST);
  api.list.mockResolvedValue(NINE_OLDEST);
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSuccess();
  });

  it("renderiza o hero com CTAs e meta institucional", async () => {
    renderHome();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cadastramento dos Terreiros de Matriz Africana",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recenseamento · Região Metropolitana de João Pessoa"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Buscar um terreiro/ }),
    ).toHaveAttribute("href", "/buscar");
    expect(screen.getByRole("link", { name: "Sobre o projeto" })).toHaveAttribute(
      "href",
      "/sobre-o-projeto",
    );
    expect(screen.getByText("FUNJOPE/PB")).toBeInTheDocument();
    expect(screen.getByText("PNUD")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /^Terreiro / })).toHaveLength(9),
    );
  });

  it("mostra os 4 números do recenseamento vindos da API", async () => {
    renderHome();

    await waitFor(() =>
      expect(
        screen.getByText("terreiros recenseados").closest(".stat"),
      ).toHaveTextContent("214"),
    );

    const photo = screen.getByText("com fotografia no acervo").closest(".stat");
    const neighborhoods = screen.getByText("bairros percorridos").closest(".stat");
    const cities = screen.getByText("cidades recenseadas").closest(".stat");

    expect(within(photo as HTMLElement).getByText("199")).toBeInTheDocument();
    expect(within(neighborhoods as HTMLElement).getByText("90")).toBeInTheDocument();
    expect(within(cities as HTMLElement).getByText("5")).toBeInTheDocument();
  });

  it("lista no máximo 9 terreiros mais antigos", async () => {
    renderHome();

    await waitFor(() =>
      expect(
        screen.getAllByRole("button", { name: /^Terreiro / }),
      ).toHaveLength(9),
    );
    expect(
      screen.getByRole("link", { name: /^Ver todos$/ }),
    ).toHaveAttribute("href", "/buscar");
    expect(screen.queryByText("Terreiro 10")).not.toBeInTheDocument();
  });

  it("renderiza as barras por nação e o link do mapeamento", async () => {
    renderHome();

    await waitFor(() =>
      expect(screen.getByRole("link", { name: /Explorar o mapeamento/ })).toBeInTheDocument(),
    );
    const bars = document.querySelector(".bars") as HTMLElement;
    expect(within(bars).getByText("Ketu")).toBeInTheDocument();
    expect(within(bars).getByText("Angola")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explorar o mapeamento/ })).toHaveAttribute(
      "href",
      "/mapeamento",
    );
    expect(screen.getByRole("link", { name: /Abrir o mapa/ })).toHaveAttribute(
      "href",
      "/mapeamento",
    );
  });

  it("renderiza os três pilares do projeto", async () => {
    renderHome();

    expect(
      screen.getByRole("heading", { name: "Visibilidade, memória e direito" }),
    ).toBeInTheDocument();
    for (const pilar of ["Visibilidade", "Memória", "Direito"]) {
      expect(screen.getByRole("heading", { name: pilar })).toBeInTheDocument();
    }
    expect(
      screen.getByText(/combater a intolerância religiosa e o racismo institucional/),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("199")).toBeInTheDocument());
  });

  it("renderiza os cards de artigos com link para cada slug", async () => {
    renderHome();

    expect(
      screen.getByRole("link", { name: /O que são Comunidades Tradicionais/ }),
    ).toHaveAttribute("href", "/artigos/comunidades-tradicionais");
    expect(
      screen.getByRole("link", { name: /Quais as linguagens do Candomblé/ }),
    ).toHaveAttribute("href", "/artigos/linguas-do-candomble");
    expect(
      screen.getByRole("link", { name: /Quais as nações do Candomblé no Brasil/ }),
    ).toHaveAttribute("href", "/artigos/nacoes-do-candomble");
    expect(screen.getAllByText(/Ler artigo/)).toHaveLength(3);
    await waitFor(() => expect(screen.getByText("199")).toBeInTheDocument());
  });

  it("exibe estado de carregamento antes da resposta da API", async () => {
    renderHome();

    expect(
      screen.getByText("Carregando os terreiros mais antigos…"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Carregando os números por nação…"),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("199")).toBeInTheDocument());
  });

  it("exibe erro com opção de tentar novamente", async () => {
    api.statsSummary.mockRejectedValue(new Error("falha"));
    api.statsByPhotoCoverage.mockRejectedValue(new Error("falha"));
    api.statsByNation.mockRejectedValue(new Error("falha"));
    api.oldest.mockRejectedValue(new Error("falha"));
    api.list.mockRejectedValue(new Error("falha"));

    renderHome();

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Não foi possível carregar os números do recenseamento.",
      ),
    );
    expect(
      screen.getByRole("button", { name: "Tentar novamente" }),
    ).toBeInTheDocument();
    // O hero e os pilares seguem visíveis mesmo com a API fora do ar.
    expect(
      screen.getByRole("heading", {
        name: "Cadastramento dos Terreiros de Matriz Africana",
      }),
    ).toBeInTheDocument();
  });

  it("exibe estado vazio quando não há terreiros aprovados", async () => {
    api.oldest.mockResolvedValue([]);

    renderHome();

    await waitFor(() =>
      expect(screen.getByText("Nenhum terreiro no acervo")).toBeInTheDocument(),
    );
  });
});
