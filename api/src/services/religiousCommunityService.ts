import {
  IReligiousCommunity,
  ReligiousCommunity,
} from "@/api/schemas/ReligiousCommunity";
import { Response } from "../@types/responsesTypes";

export const religiousCommunityService = {
  list: async (): Promise<Response<IReligiousCommunity[]>> => {
    try {
      const religiousCommunities = await ReligiousCommunity.find();

      return {
        data: religiousCommunities,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
};
