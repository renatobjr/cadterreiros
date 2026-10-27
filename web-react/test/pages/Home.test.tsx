import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Home from "../../src/pages/Home";

vi.mock("../../src/api/communities", () => ({
  communitiesApi: {
    oldest: vi.fn().mockResolvedValue([
      {
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
      },
    ]),
  },
  default: { oldest: vi.fn().mockResolvedValue([]) },
}));

describe("Home", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza dados reais", async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByText("Terreiro X")).toBeInTheDocument());
  });
});
