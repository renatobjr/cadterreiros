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
  communityAddress: CommunityAddress;
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