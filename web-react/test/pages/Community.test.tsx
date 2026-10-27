import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Community from "../../src/pages/Community";

const current = {
  id: "1",
  slugify: "terreiro-ile-axe",
  authorization: true,
  communityGoogleApiLocalization: { lat: -7.12, long: -34.88 },
  lat: -7.12,
  long: -34.88,
  communityAddress: {
    fullAddress: "Centro, João Pessoa",
    street: "Rua A",
    number: "10",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
  neighborhood: "Centro",
  city: "João Pessoa",
  communityType: "comunidade de terreiro" as const,
  religiousSpaceYearFoundation: 1950,
  religiousSpaceLeaderFoundation: "Pai Joaquim",
  religiousSpaceNation: "ketu" as const,
  religiousSpacePraticalLanguages: "yoruba" as const,
  religiousSpaceName: "Terreiro Ilê Axé",
  religiousSpaceLeaderName: "Mãe Ana",
  religiousSpacePositionName: "Ialorixá",
  religiousSpaceStartedBy: "Pai Joaquim",
  religiousSpaceNameDateStartedBy: "1950-05-12",
  leaderEthnicity: "preta",
  leaderGender: "feminino",
  leaderEducationalLevel: "superior",
  leaderSufferedRacism: false,
  religiousSpaceStatus: "active" as const,
  censusStep: "approved" as const,
  registeredVoluntarily: false,
  bio: "Comunidade fundada em 1950 por Pai Joaquim.",
  censusTaker: null,
  createdAt: "2020-01-01T12:00:00.000Z",
  updatedAt: "2020-01-01T12:00:00.000Z",
};

const neighbor = {
  ...current,
  id: "2",
  slugify: "terreiro-vizinho",
  religiousSpaceName: "Terreiro Vizinho",
  religiousSpaceYearFoundation: 1960,
  communityAddress: { ...current.communityAddress, neighborhood: "Centro" },
  neighborhood: "Centro",
};

const sameNation = {
  ...current,
  id: "3",
  slugify: "terreiro-da-nacao",
  religiousSpaceName: "Terreiro da Nação",
  communityAddress: { ...current.communityAddress, neighborhood: "Torre" },
  neighborhood: "Torre",
};

const getById = vi.fn();
const list = vi.fn();

vi.mock("../../src/api/communities", () => ({
  communitiesApi: {
    getById: (...args: unknown[]) => getById(...args),
    list: (...args: unknown[]) => list(...args),
  },
  default: { getById: vi.fn(), list: vi.fn() },
}));

function renderWithId(id = "1") {
  return render(
    <MemoryRouter>
      <Community id={id} />
    </MemoryRouter>,
  );
}

function renderWithRoute(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/terreiro/${slug}`]}>
      <Routes>
        <Route path="/terreiro/:slug" element={<Community />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Community", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    list.mockResolvedValue([current, neighbor, sameNation]);
    getById.mockResolvedValue(current);
  });

  it("renderiza a ficha completa conforme o mock", async () => {
    renderWithId();

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Terreiro Ilê Axé",
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Terreiro · ketu")).toBeInTheDocument();
    expect(
      screen.getByText("Centro, João Pessoa · Comunidade de terreiro · Desde 1950"),
    ).toBeInTheDocument();
    expect(screen.getByText("Fundação em 1950")).toBeInTheDocument();
    expect(
      screen.getByText("Comunidade fundada em 1950 por Pai Joaquim."),
    ).toBeInTheDocument();
    expect(screen.getByText("Localização registrada")).toBeInTheDocument();

    const ficha = screen.getByText("Ficha do censo").closest(".card") as HTMLElement;
    expect(within(ficha).getByText("1950")).toBeInTheDocument();
    expect(within(ficha).getByText("Centro")).toBeInTheDocument();
    expect(within(ficha).getByText("João Pessoa")).toBeInTheDocument();
    expect(within(ficha).getByText("01/01/2020")).toBeInTheDocument();
    expect(within(ficha).getByText("não informado")).toBeInTheDocument();
  });

  it("mostra a navegação, as ações e os terreiros próximos", async () => {
    renderWithId();

    const crumbs = await screen.findByRole("navigation", {
      name: "Trilha de navegação",
    });
    expect(within(crumbs).getByRole("link", { name: "Início" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(within(crumbs).getByText("Terreiro Ilê Axé")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Copiar link da ficha" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar à busca" })).toHaveAttribute(
      "href",
      "/buscar",
    );

    const related =
      screen.getByRole("heading", { name: "Terreiros próximos" })
        .closest("section") as HTMLElement;
    expect(within(related).getByText("Terreiro Vizinho")).toBeInTheDocument();
    expect(within(related).getByText("Terreiro da Nação")).toBeInTheDocument();
  });

  it("resolve a ficha pelo slug quando o id não existe", async () => {
    getById.mockResolvedValue(null);
    renderWithRoute("terreiro-ile-axe");

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Terreiro Ilê Axé",
      }),
    ).toBeInTheDocument();
    expect(getById).toHaveBeenCalledWith("terreiro-ile-axe");
  });

  it("exibe estado de não encontrado", async () => {
    getById.mockResolvedValue(null);
    list.mockResolvedValue([]);
    renderWithId("inexistente");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Terreiro não encontrado" }),
      ).toBeInTheDocument(),
    );
  });

  it("usa fallback quando a comunidade não tem bio", async () => {
    getById.mockResolvedValue({ ...current, bio: null });
    renderWithId();

    expect(
      await screen.findByText("Não informado no censo."),
    ).toBeInTheDocument();
  });
});
