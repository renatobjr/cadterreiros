import type { ReligiousCommunity } from "../../src/domain/types";

const BASE: ReligiousCommunity = {
  id: "1",
  authorization: true,
  communityGoogleApiLocalization: { lat: -7.12, long: -34.88 },
  communityType: "comunidade de terreiro",
  religiousSpaceYearFoundation: 1990,
  religiousSpaceLeaderFoundation: "Pai",
  religiousSpaceNation: "ketu",
  religiousSpacePraticalLanguages: "yoruba",
  religiousSpaceName: "Terreiro Teste",
  religiousSpaceLeaderName: "Mãe Ana",
  religiousSpacePositionName: "Ialorixá",
  religiousSpaceStartedBy: "Pai",
  religiousSpaceNameDateStartedBy: "1990-01-01",
  leaderEthnicity: "preta",
  leaderGender: "feminino",
  leaderEducationalLevel: "superior",
  leaderSufferedRacism: false,
  religiousSpaceStatus: "active",
  censusStep: "pending",
  registeredVoluntarily: false,
  censusTakerId: "user-admin",
  censusTakerFullname: "Renato Jr.",
  bio: "Comunidade de terreiro de tradição ketu.",
  communityAddress: {
    street: "Rua das Flores",
    number: "10",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
  leaderContacts: { email: "contato@example.org", phone: "83999990000" },
  createdAt: "2020-01-01",
  updatedAt: "2020-01-02",
} as ReligiousCommunity;

/** Registro administrativo base para os testes do painel. */
export function makeCommunity(
  overrides: Partial<ReligiousCommunity> = {},
): ReligiousCommunity {
  return { ...BASE, ...overrides };
}
