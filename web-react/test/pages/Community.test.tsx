import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Community from "../../src/pages/Community";

vi.mock("../../src/api/communities", () => ({
  communitiesApi: {
    getById: vi.fn().mockResolvedValue({
      id: "1",
      authorization: true,
      communityGoogleApiLocalization: { lat: 0, long: 0 },
      communityAddress: { fullAddress: "x", street: "Rua", number: "1", neighborhood: "Bairro", city: "João Pessoa", state: "PB", zipcode: "0" },
      communityType: "matriz africana",
      religiousSpaceYearFoundation: 1990,
      religiousSpaceLeaderFoundation: "x",
      religiousSpaceNation: "ketu",
      religiousSpacePraticalLanguages: "yoruba",
      religiousSpaceName: "Terreiro Y",
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
    }),
  },
  default: { getById: vi.fn().mockResolvedValue(null) },
}));

describe("Community", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza", async () => {
    render(<Community id="1" />);
    await waitFor(() => expect(screen.getByText("Terreiro Y")).toBeInTheDocument());
  });
});
