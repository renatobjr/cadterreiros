import type mongoose from "mongoose";
import { model, Schema } from "mongoose";

const CommunityAddressSchema = new Schema({
  fullAddress: { type: String, required: true },
  street: { type: String, required: true },
  number: { type: String, required: true },
  neighborhood: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
});

const GeoLocationSchema = new Schema({
  lat: { type: Number, required: true },
  long: { type: Number, required: true },
});

const ReligiousCommunitySchema = new Schema({
  authorization: { type: Number, required: true },
  community_google_api_localization: {
    type: GeoLocationSchema,
    required: true,
  },
  community_address: { type: CommunityAddressSchema, required: true },
  community_type: { type: String, required: true },
  religious_space_year_foundation: { type: Number, required: true },
  religious_space_leader_foundation: { type: String, required: true },
  religious_space_nation: { type: String, required: true },
  religious_space_pratical_languages: { type: String, required: true },
  religious_space_name: { type: String, required: true },
  religious_space_leader_name: { type: String, required: true },
  religious_space_position_name: { type: String, required: true },
  religious_space_started_by: { type: String, required: true },
  religious_space_name_date_started_by: { type: Date, required: true },
  leader_ethnicity: { type: String, required: true },
  leader_sex_orientation: { type: String, required: true },
  leader_educational_level: { type: String, required: true },
  religious_space_main_picture: { type: String, required: true },
});

ReligiousCommunitySchema.path("religious_space_started_by").set(
  (value: string | Date) => {
    if (typeof value === "string") {
      return new Date(value);
    }
    return value;
  }
);

interface IReligiousCommunityModel extends mongoose.Document {}

export const ReligiousCommunity = model<IReligiousCommunityModel>(
  "ReligiousCommunity",
  ReligiousCommunitySchema
);
