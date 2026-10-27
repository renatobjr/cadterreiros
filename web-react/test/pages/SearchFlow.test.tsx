import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Search from "../../src/pages/Search";
import { communitiesApi } from "../../src/api/communities";
import type { ReligiousCommunity } from "../../src/domain/types";

vi.mock("../../src/api/communities", () => ({
  communitiesApi: { list: vi.fn() },
  default: { list: vi.fn() },
}));

function community(
  id: string,
  name: string,
  nation: ReligiousCommunity["religiousSpaceNation"] = "umbanda",
): ReligiousCommunity {
  return {
    id,
    authorization: true,
    communityGoogleApiLocalization: { lat: -7.115, long: -34.864 },
    communityAddress: {
      fullAddress: `Rua A, 1, Centro, João Pessoa - PB`,
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

describe("Fluxo de busca", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(communitiesApi.list).mockResolvedValue(sampleCommunities);
  });

  it("carrega e renderiza os resultados da API", async () => {
    render(<Search />);

    expect(await screen.findByText("2 encontrados")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Terreiro Ilê Axé" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Casa de Nagô" }),
    ).toBeInTheDocument();
    expect(communitiesApi.list).toHaveBeenCalled();
  });

  it("filtra localmente quando o filtro de texto muda", async () => {
    render(<Search />);
    await screen.findByText("2 encontrados");

    fireEvent.change(screen.getByLabelText(/busca/i), {
      target: { value: "nagô" },
    });

    await waitFor(() => {
      expect(screen.getByText("1 encontrados")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Casa de Nagô" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Terreiro Ilê Axé" }),
    ).not.toBeInTheDocument();
  });

  it("exibe estado vazio quando nenhum terreiro corresponde ao filtro", async () => {
    render(<Search />);
    await screen.findByText("2 encontrados");

    fireEvent.change(screen.getByLabelText(/busca/i), {
      target: { value: "inexistente" },
    });

    expect(await screen.findByText("Nenhum resultado.")).toBeInTheDocument();
    expect(screen.getByText("0 encontrados")).toBeInTheDocument();
  });

  it("pagina os resultados de nove em nove", async () => {
    vi.mocked(communitiesApi.list).mockResolvedValue(
      Array.from({ length: 12 }, (_, index) =>
        community(String(index + 1), `Terreiro ${index + 1}`),
      ),
    );

    render(<Search />);
    expect(await screen.findByText("12 encontrados")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /^Terreiro \d+$/ }),
    ).toHaveLength(9);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /próxima/i }));

    expect(
      screen.getAllByRole("button", { name: /^Terreiro \d+$/ }),
    ).toHaveLength(3);
    expect(screen.getByText("2 / 2")).toBeInTheDocument();
  });
});
