import {
  IReligiousCommunity,
  ReligiousCommunity,
} from "@/api/schemas/ReligiousCommunity";
import { ApiResponseType } from "@/api/@types/responsesTypes";
import OpenAI from "openai";
import { gptPrompt } from "../configs/gptPrompt";
import { Types } from "mongoose";

type searchType = {
  search: string;
};

interface SearchCondition {
  [key: string]: any;
}

export const religiousCommunityService = {
  list: async (
    options: searchType
  ): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      let searchTerm = {};

      if (options.search) {
        const searchValue = options.search.trim();
        const isYear = /^\d{4}$/.test(searchValue);

        const orConditions: SearchCondition[] = [
          { religious_space_name: { $regex: searchValue, $options: "i" } },
          {
            "community_address.neighborhood": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "community_address.city": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            religious_space_nation: {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            community_type: {
              $regex: searchValue,
              $options: "i",
            },
          },
        ];

        if (isYear) {
          orConditions.push({
            religious_space_year_foundation: parseInt(searchValue, 10),
          });
        }

        searchTerm = { $or: orConditions };
      }

      const religiousCommunities = await ReligiousCommunity.find(searchTerm);

      return {
        results: religiousCommunities,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
  getRamdom: async (): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      const getRamdomCommunities = await ReligiousCommunity.aggregate([
        { $sample: { size: 9 } },
      ]);

      return {
        results: getRamdomCommunities,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
  getDataFromMaping: async () => {
    try {
      const totalReligiousCommunities =
        await ReligiousCommunity.countDocuments();

      const totalCities = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: "$community_address.city",
          },
        },
        {
          $count: "total",
        },
      ]);

      const totalNeighborhoods = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: "$community_address.neighborhood",
          },
        },
        {
          $count: "total",
        },
      ]);

      return {
        results: {
          totalReligiousCommunities,
          totalCities: totalCities[0].total || 0,
          totalNeighborhoods: totalNeighborhoods[0].total || 0,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
  getCommunityById: async (
    id: string
  ): Promise<ApiResponseType<IReligiousCommunity | string>> => {
    try {
      const religiousCommunity = await ReligiousCommunity.findById(id);

      if (!religiousCommunity) {
        return {
          error: "Religious Community not found",
          status: false,
        };
      }

      if (!religiousCommunity.bio) {
        console.log("[✔] Generated bio");

        const gptClient = new OpenAI({
          apiKey: process.env.GPT_API_KEY as string,
        });

        const gptResponse = await gptClient.chat.completions.create({
          model: "gpt-3.5-turbo-1106",
          messages: [
            {
              role: "user",
              content: gptPrompt("bio", religiousCommunity),
            },
          ],
        });

        religiousCommunity.bio =
          gptResponse.choices[0].message?.content ??
          "Não há uma bio para essa comunidade";
        await religiousCommunity.save();
      }

      const aggregateReligiousCommunity: any =
        await ReligiousCommunity.aggregate([
          {
            $match: {
              _id: new Types.ObjectId(id),
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "censusTaker",
              foreignField: "_id",
              as: "censusTaker",
            },
          },
          {
            $unwind: "$censusTaker",
          },
        ]);

      return {
        results: aggregateReligiousCommunity,
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
