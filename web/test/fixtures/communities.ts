import type { ReligiousCommunity } from "../../src/domain/types";

const base: ReligiousCommunity = {
  id: "base",
  authorization: true,
  communityGoogleApiLocalization: { lat: -7.1195, long: -34.8451 },
  communityAddress: {
    fullAddress: "Rua da Aurora, 10, Centro, João Pessoa - PB",
    street: "Rua da Aurora",
    number: "10",
    neighborhood: "Centro",
    city: "João Pessoa",
    state: "PB",
    zipcode: "58000-000",
  },
  communityType: "matriz africana",
  religiousSpaceYearFoundation: 1950,
  religiousSpaceLeaderFoundation: "1950",
  religiousSpaceNation: "ketu",
  religiousSpacePraticalLanguages: "yoruba",
  religiousSpaceName: "Ilê Axé Oxum",
  religiousSpaceLeaderName: "Mãe Oxum",
  religiousSpacePositionName: "Ialorixá",
  religiousSpaceStartedBy: "Mãe Oxum",
  religiousSpaceNameDateStartedBy: "1950",
  leaderEthnicity: "parda",
  leaderGender: "feminino",
  leaderEducationalLevel: "fundamental",
  leaderSufferedRacism: false,
  religiousSpaceStatus: "active",
  censusStep: "approved",
  censusTaker: null,
  registeredVoluntarily: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  lat: -7.1195,
  long: -34.8451,
};

/** Cria uma comunidade aprovada completa, sobrescrevendo só o que o teste usa. */
export function makeCommunity(
  overrides: Partial<ReligiousCommunity> = {},
): ReligiousCommunity {
  return { ...base, ...overrides };
}

/** Quatro terreiros com nações, cidades, tipos e décadas distintas. */
export const sampleCommunities: ReligiousCommunity[] = [
  makeCommunity({ id: "1" }),
  makeCommunity({
    id: "2",
    religiousSpaceName: "Ilê Axé Ogum",
    communityAddress: {
      fullAddress: "Rua das Mangueiras, 20, Mangabeira, João Pessoa - PB",
      street: "Rua das Mangueiras",
      number: "20",
      neighborhood: "Mangabeira",
      city: "João Pessoa",
      state: "PB",
      zipcode: "58000-001",
    },
    religiousSpaceYearFoundation: 1990,
    lat: -7.15,
    long: -34.83,
  }),
  makeCommunity({
    id: "3",
    religiousSpaceName: "Terreiro de Umbanda Caboclo",
    communityType: "comunidade de terreiro",
    religiousSpaceNation: "umbanda",
    religiousSpaceYearFoundation: 2000,
    religiousSpaceMainPicture: "/foto.jpg",
  }),
  makeCommunity({
    id: "4",
    religiousSpaceName: "Nzo Angola",
    communityType: "comunidade de terreiro",
    religiousSpaceNation: "angola",
    religiousSpaceYearFoundation: 2020,
    communityAddress: {
      fullAddress: "Rua do Alto, 30, Alto Boa Vista, Bayeux - PB",
      street: "Rua do Alto",
      number: "30",
      neighborhood: "Alto Boa Vista",
      city: "Bayeux",
      state: "PB",
      zipcode: "58300-000",
    },
    lat: -7.12,
    long: -34.93,
  }),
];
