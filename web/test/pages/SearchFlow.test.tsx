import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Search from "../../src/pages/Search";
import { communitiesApi } from "../../src/api/communities";
import type { ReligiousCommunity } from "../../src/domain/types";

vi.mock("../../src/api/communities", () => ({
  communitiesApi: {
    list: vi.fn(),
    statsSummary: vi.fn().mockResolvedValue({ totalReligiousCommunities: 2, totalCities: 1, totalNeighborhoods: 1 }),
  },
  default: { list: vi.fn() },
}));

function community(
  id: string,
  name: string,
  nation: ReligiousCommunity["religiousSpaceNation"] = "umbanda",
  fullAddress = "Centro, João Pessoa, PB",
): ReligiousCommunity {
  return {
    id,
    authorization: true,
    communityGoogleApiLocalization: { lat: -7.115, long: -34.864 },
    communityAddress: {
      fullAddress,
      street: "Rua A",
      number: "1",
      neighborhood: "Centro",
      city: "João Pessoa",
      state: "PB",
      zipcode: "58000-000",
    },
    communityType: "matriz africana",
    religiousSpaceYearFoundation: 1950,
    religiousSpaceLeaderFoundation: name,
    religiousSpaceNation: nation,
    religiousSpacePraticalLanguages: "yoruba",
    religiousSpaceName: name,
    religiousSpaceLeaderName: "Liderança",
    religiousSpacePositionName: "Pai",
    religiousSpaceStartedBy: "Fundador",
    religiousSpaceNameDateStartedBy: "1950",
    leaderEthnicity: "negra",
    leaderGender: "masculino",
    leaderEducationalLevel: "superior",
    leaderSufferedRacism: false,
    religiousSpaceStatus: "active",
    censusStep: "approved",
    registeredVoluntarily: true,
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
  };
}

const sampleCommunities = [
  community("1", "Terreiro Ilê Axé", "umbanda"),
  community("2", "Casa de Nagô", "nagô"),
];

function renderSearch() {
  return render(
    <MemoryRouter>
      <Search />
    </MemoryRouter>,
  );
}

describe("Fluxo de busca", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(communitiesApi.list).mockResolvedValue(sampleCommunities);
  });

  it("carrega e renderiza os resultados da API com o cabeçalho do protótipo", async () => {
    renderSearch();

    expect(await screen.findByText("2 terreiros encontrados")).toBeInTheDocument();
    expect(screen.getByText(/Os 2 registros do censo/i)).toBeInTheDocument();
    expect(screen.getByText(/Mostrando 1–2 de 2/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Terreiro Ilê Axé/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Casa de Nagô/i })).toBeInTheDocument();
    expect(communitiesApi.list).toHaveBeenCalled();
  });

  it("filtra localmente quando o filtro de texto muda", async () => {
    renderSearch();
    await screen.findByText("2 terreiros encontrados");

    fireEvent.change(screen.getByLabelText(/buscar/i), {
      target: { value: "nagô" },
    });

    await waitFor(() => {
      expect(screen.getByText("1 terreiro encontrado")).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: /Casa de Nagô/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Terreiro Ilê Axé/i })).not.toBeInTheDocument();
  });

  it("exibe estado vazio quando nenhum terreiro corresponde ao filtro", async () => {
    renderSearch();
    await screen.findByText("2 terreiros encontrados");

    fireEvent.change(screen.getByLabelText(/buscar/i), {
      target: { value: "inexistente" },
    });

    expect(await screen.findByText("Nenhum resultado")).toBeInTheDocument();
    expect(screen.getByText("0 terreiros encontrados")).toBeInTheDocument();
  });

  it("pagina os resultados de doze em doze", async () => {
    vi.mocked(communitiesApi.list).mockResolvedValue(
      Array.from({ length: 20 }, (_, index) =>
        community(String(index + 1), `Terreiro ${index + 1}`),
      ),
    );

    renderSearch();
    expect(await screen.findByText("20 terreiros encontrados")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /^Terreiro \d+$/ }),
    ).toHaveLength(12);
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /próxima/i }));

    expect(
      screen.getAllByRole("link", { name: /^Terreiro \d+$/ }),
    ).toHaveLength(8);
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("alterna entre grade e tabela", async () => {
    renderSearch();
    await screen.findByText("2 terreiros encontrados");

    const grid = screen.getAllByRole("button", { name: /grade/i })[0];
    fireEvent.click(screen.getAllByRole("button", { name: /tabela/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeInTheDocument();
      expect(screen.getByRole("cell", { name: "Casa de Nagô" })).toBeInTheDocument();
    });

    fireEvent.click(grid);
    await waitFor(() => {
      expect(screen.queryByRole("table")).not.toBeInTheDocument();
    });
  });
});
