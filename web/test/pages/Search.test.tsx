import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Search from "../../src/pages/Search";
import { communitiesApi } from "../../src/api/communities";

vi.mock("../../src/api/communities", () => {
  const sample = {
    id: "1",
    authorization: true,
    communityGoogleApiLocalization: { lat: 0, long: 0 },
    communityAddress: { fullAddress: "x", street: "Rua", number: "1", neighborhood: "Bairro", city: "João Pessoa", state: "PB", zipcode: "0" },
    communityType: "matriz africana",
    religiousSpaceYearFoundation: 1990,
    religiousSpaceLeaderFoundation: "x",
    religiousSpaceNation: "ketu",
    religiousSpacePraticalLanguages: "yoruba",
    religiousSpaceName: "Terreiro X",
    religiousSpaceLeaderName: "Lider",
    religiousSpacePositionName: "Pai",
    religiousSpaceStartedBy: "x",
    religiousSpaceNameDateStartedBy: "x",
    leaderEthnicity: "x",
    leaderGender: "x",
    leaderEducationalLevel: "x",
    leaderSufferedRacism: false,
    religiousSpaceStatus: "active",
    censusStep: "approved",
    registeredVoluntarily: true,
    createdAt: "2020-01-01",
    updatedAt: "2020-01-01",
  };
  return {
    communitiesApi: {
      list: vi.fn().mockResolvedValue([sample]),
      statsSummary: vi.fn().mockResolvedValue({ totalReligiousCommunities: 1, totalCities: 1, totalNeighborhoods: 1 }),
    },
    default: { list: vi.fn() },
  };
});

describe("Search", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filtra SPA", async () => {
    render(
      <MemoryRouter>
        <Search />
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByText("Terreiro X")).toBeInTheDocument());
    const input = screen.getByLabelText(/busca/i);
    fireEvent.change(input, { target: { value: "abc" } });
    await waitFor(() => expect(communitiesApi.list).toHaveBeenCalled());
  });
});
