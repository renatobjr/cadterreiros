import type mongoose from "mongoose";
import { model, ObjectId, Schema } from "mongoose";
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
  nagô = "nagô",
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
  phone: string | number | undefined;
  mobile: string | number | undefined;
  email: string | undefined;
}

export enum EReligiousSpaceStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export enum ECensusStep {
  REVISION = "revision",
  DISAPPROVED = "disapproved",
  APPROVED = "approved",
}

export interface IReligiousCommunity {
  authorization: number;
  community_google_api_localization: IGeoLocation;
  community_address: ICommunityAddress;
  community_type: string;
  religious_space_year_foundation: number;
  religious_space_leader_foundation: string;
  religious_space_nation: string;
  religious_space_pratical_languages: string;
  religious_space_name: string;
  religious_space_leader_name: string;
  religious_space_position_name: string;
  religious_space_started_by: string;
  religious_space_name_date_started_by: Date | string;
  leader_contacts: IContacts;
  leader_ethnicity: string;
  leader_sex_orientation: string;
  leader_educational_level: string;
  religious_space_main_picture: string;
  religious_space_status: EReligiousSpaceStatus;
  censusStep: ECensusStep;
  censusTaker: ObjectId;
  createdAt: Date | string;
}

const ReligiousCommunitySchema = new Schema(
  {
    authorization: { type: Boolean, required: true },
    community_google_api_localization: {
      type: Object,
      required: true,
    },
    community_address: { type: Object, required: true },
    community_type: { type: String, required: true, enum: CommunityType },
    religious_space_year_foundation: { type: Number, required: true },
    religious_space_leader_foundation: { type: String, required: true },
    religious_space_nation: {
      type: String,
      required: true,
      enum: ReligiousSpaceNation,
    },
    religious_space_pratical_languages: {
      type: String,
      required: true,
      enum: ReligiousSpacePraticalLanguages,
    },
    religious_space_name: { type: String, required: true },
    religious_space_leader_name: { type: String, required: true },
    religious_space_position_name: { type: String, required: true },
    religious_space_started_by: { type: String, required: true },
    religious_space_name_date_started_by: { type: Date, required: true },
    leader_contacts: { type: Object, required: false },
    leader_ethnicity: { type: String, required: true },
    leader_sex_orientation: { type: String, required: true },
    leader_educational_level: { type: String, required: true },
    religious_space_main_picture: { type: String, required: true },
    religious_space_status: {
      type: String,
      required: true,
      enum: EReligiousSpaceStatus,
    },
    censusStep: {
      type: String,
      required: true,
      enum: ECensusStep,
    },
    censusTaker: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

ReligiousCommunitySchema.path("religious_space_name_date_started_by").set(
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
