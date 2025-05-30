import {
  IReligiousCommunity,
  ReligiousCommunity,
} from "@/api/schemas/ReligiousCommunity";
import { ApiResponseType } from "../@types/responsesTypes";

export const religiousCommunityService = {
  list: async (): Promise<ApiResponseType<IReligiousCommunity[]>> => {
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
