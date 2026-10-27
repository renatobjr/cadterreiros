export interface CommunityAddress {
  fullAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface GeoLocation {
  lat: number;
  long: number;
}

export interface Contacts {
  phone?: string | number;
  mobile?: string | number;
  email?: string;
}

export type CommunityType = 'matriz africana' | 'comunidade de terreiro';
export type ReligiousSpaceNation =
  | 'angola'
  | 'ekiti efon'
  | 'jeje'
  | 'ketu'
  | 'nagô'
  | 'quimbanda'
  | 'tambor de mina'
  | 'umbanda'
  | 'outros';
export type ReligiousSpacePraticalLanguages =
  | 'yoruba'
  | 'quicongo'
  | 'umbundo'
  | 'ewe fon'
  | 'outros';
export type EReligiousSpaceStatus = 'active' | 'inactive';
export type ECensusStep = 'approved' | 'pending' | 'rejected';

export interface ReligiousCommunity {
  id: string;
  authorization: boolean;
  communityGoogleApiLocalization: GeoLocation;
  communityAddress?: CommunityAddress;
  fullAddress?: string;
  slugify?: string;
  lat?: number;
  long?: number;
  communityType: CommunityType;
  religiousSpaceYearFoundation: number;
  religiousSpaceLeaderFoundation: string;
  religiousSpaceNation: ReligiousSpaceNation;
  religiousSpacePraticalLanguages: ReligiousSpacePraticalLanguages;
  religiousSpaceName: string;
  religiousSpaceLeaderName: string;
  religiousSpacePositionName: string;
  religiousSpaceStartedBy: string;
  religiousSpaceNameDateStartedBy: string;
  leaderContacts?: Contacts;
  leaderEthnicity: string;
  leaderGender: string;
  leaderEducationalLevel: string;
  leaderSocialProgram?: object | null;
  leaderSufferedRacism: boolean;
  religiousSpaceMainPicture?: string;
  religiousSpaceStatus: EReligiousSpaceStatus;
  religiousSpaceEvents?: unknown[];
  bio?: string;
  censusStep: ECensusStep;
  censusTaker?: string | null;
  rejectedReason?: string;
  registeredVoluntarily: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NationStats {
  nation: string;
  count: number;
}

export interface CityStats {
  city: string;
  count: number;
}

export interface DecadeStats {
  decade: string;
  count: number;
}

export interface TypeByNationStats {
  nation: string;
  african: number;
  traditional: number;
}

export interface TypeStats {
  type: string;
  count: number;
}

export interface GenderStats {
  gender: string;
  count: number;
}

export interface EthnicityStats {
  ethnicity: string;
  count: number;
}

export interface LanguageStats {
  language: string;
  count: number;
}

export interface NeighborhoodStats {
  neighborhood: string;
  count: number;
}

export interface PhotoCoverageStats {
  withPhoto: number;
  withoutPhoto: number;
  total: number;
}

export interface StatsSummary {
  totalReligiousCommunities: number;
  totalCities: number;
  totalNeighborhoods: number;
}

/** Conjunto completo das agregações públicas consumidas pelo mapeamento. */
export interface MappingStats {
  summary: StatsSummary;
  byNation: NationStats[];
  byCity: CityStats[];
  byDecade: DecadeStats[];
  byTypeAndNation: TypeByNationStats[];
  byType: TypeStats[];
  byLeaderGender: GenderStats[];
  byLeaderEthnicity: EthnicityStats[];
  byLanguage: LanguageStats[];
  byNeighborhood: NeighborhoodStats[];
  byPhotoCoverage: PhotoCoverageStats;
}