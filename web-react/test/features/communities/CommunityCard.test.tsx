import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CommunityCard from "../../../src/features/communities/components/CommunityCard";
import type { ReligiousCommunity } from "../../../src/domain/types";

const community: ReligiousCommunity = {
  id: "1",
  authorization: true,
  communityGoogleApiLocalization: { lat: 0, long: 0 },
  communityAddress: {
    fullAddress: "x",
    street: "Rua",
    number: "1",
    neighborhood: "Bairro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "0",
  },
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

describe("CommunityCard", () => {
  it("renderiza com dados", () => {
    render(<CommunityCard community={community} />);
    expect(screen.getByText("Terreiro X")).toBeInTheDocument();
    expect(screen.getByText(/João Pessoa, PB/)).toBeInTheDocument();
  });

  it("chama onClick ao clicar", () => {
    const onClick = vi.fn();
    render(<CommunityCard community={community} onClick={onClick} />);
    // button has aria-label name
    // find button by role
    const btn = screen.getByRole("button");
    btn.click();
    expect(onClick).toHaveBeenCalledWith(community);
  });
});