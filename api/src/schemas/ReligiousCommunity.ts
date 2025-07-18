import type mongoose from "mongoose";
import { model, Schema, Types } from "mongoose";
import dayjs from "dayjs";

enum CommunityType {
  MATRIZ_AFRICANA = "matriz africana",
  COMUNIDADE_TERREIRO = "comunidade de terreiro",
}

enum ReligiousSpaceNation {
  ANGOLA = "angola",
  EKITI_EFONO = "ekiti efon",
  JEJE = "jeje",
  KETU = "ketu",
  NAGO = "nagô",
  QUIMBANDA = "quimbanda",
  TAMBOR_DE_MINA = "tambor de mina",
  UMBANDA = "umbanda",
  OUTROS = "outros",
}

enum ReligiousSpacePraticalLanguages {
  YORUBA = "yoruba",
  QUICONGO = "quicongo",
  UMBUNDO = "umbundo",
  EWE_FONO = "ewe fon",
  OUTROS = "outros",
}

export interface ICommunityAddress {
  fullAddress: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export interface IGeoLocation {
  lat: number;
  long: number;
}

export interface IContacts {
  phone?: string | number | undefined;
  mobile?: string | number | undefined;
  email?: string | undefined;
}

export enum EReligiousSpaceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ECensusStep {
  APPROVED = "approved",
  PENDING = "pending",
  REJECTED = "rejected",
}

export interface IReligiousCommunity {
  authorization: number;
  communityGoogleApiLocalization: IGeoLocation;
  communityAddress: ICommunityAddress;
  communityType: string;
  religiousSpaceYearFoundation: number;
  religiousSpaceLeaderFoundation: string;
  religiousSpaceNation: string;
  religiousSpacePraticalLanguages: string;
  religiousSpaceName: string;
  religiousSpaceLeaderName: string;
  religiousSpacePositionName: string;
  religiousSpaceStartedBy: string;
  religiousSpaceNameDateStartedBy: Date | string;
  leaderContacts: IContacts;
  leaderEthnicity: string;
  leaderGender: string;
  leaderEducationalLevel: string;
  leaderSocialProgram: Object | null;
  leaderSufferedRacism: boolean;
  religiousSpaceMainPicture: string;
  religiousSpaceStatus: EReligiousSpaceStatus;
  bio?: string | undefined;
  censusStep: ECensusStep;
  censusTaker: Types.ObjectId;
  rejectedReason?: string;
  createdAt: Date | string;
}

const ReligiousCommunitySchema = new Schema(
  {
    authorization: { type: Boolean, required: true },
    communityGoogleApiLocalization: {
      type: Object,
      required: true,
    },
    communityAddress: { type: Object, required: true },
    communityType: { type: String, required: true, enum: CommunityType },
    religiousSpaceYearFoundation: { type: Number, required: true },
    religiousSpaceLeaderFoundation: { type: String, required: true },
    religiousSpaceNation: {
      type: String,
      required: true,
      enum: ReligiousSpaceNation,
    },
    religiousSpacePraticalLanguages: {
      type: String,
      required: true,
      enum: ReligiousSpacePraticalLanguages,
    },
    religiousSpaceName: { type: String, required: true },
    religiousSpaceLeaderName: { type: String, required: true },
    religiousSpacePositionName: { type: String, required: true },
    religiousSpaceStartedBy: { type: String, required: true },
    religiousSpaceNameDateStartedBy: { type: Date, required: true },
    leaderContacts: { type: Object, required: false },
    leaderEthnicity: { type: String, required: true },
    leaderGender: { type: String, required: true },
    leaderEducationalLevel: { type: String, required: true },
    leaderSocialProgram: { type: Object, required: false },
    leaderSufferedRacism: { type: Boolean, required: true },
    religiousSpaceMainPicture: { type: String, required: false },
    religiousSpaceStatus: {
      type: String,
      required: true,
      enum: EReligiousSpaceStatus,
      default: EReligiousSpaceStatus.ACTIVE,
    },
    bio: { type: String, required: false },
    censusStep: {
      type: String,
      required: true,
      enum: ECensusStep,
      default: ECensusStep.PENDING,
    },
    censusTaker: { type: Schema.Types.ObjectId, required: true },
    rejectedReason: { type: String, required: false },
  },
  { timestamps: true }
);

ReligiousCommunitySchema.path("religiousSpaceNameDateStartedBy").set(
  (value: string | Date) => {
    if (typeof value === "string") {
      return dayjs(value).toDate();
    }
    return value;
  }
);

ReligiousCommunitySchema.path("createdAt").set((value: string | Date) => {
  if (typeof value === "string") {
    return dayjs(value).toDate();
  }
  return value;
});

interface IReligiousCommunityModel
  extends IReligiousCommunity,
    mongoose.Document {}

export const ReligiousCommunity = model<IReligiousCommunityModel>(
  "ReligiousCommunity",
  ReligiousCommunitySchema
);
