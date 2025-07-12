import {
  ECensusStep,
  IReligiousCommunity,
  ReligiousCommunity,
} from "@/api/schemas/ReligiousCommunity";
import { ApiResponseType } from "@/api/@types/responsesTypes";
import OpenAI from "openai";
import { gptPrompt } from "../configs/gptPrompt";
import { Types } from "mongoose";
import { IUser, User } from "../schemas/User";
import fileUtils from "../utils/file.utils";
import fs from "fs";

type searchType = {
  search: string;
};

interface SearchCondition {
  [key: string]: any;
}

export const religiousCommunityService = {
  createReligiousCommunity: async (
    religiousCommunity: Partial<IReligiousCommunity>,
    userId: string
  ): Promise<ApiResponseType<IReligiousCommunity>> => {
    try {
      religiousCommunity.censusTaker = new Types.ObjectId(userId);
      religiousCommunity.censusStep = ECensusStep.PENDING;

      const createdCommunity = await ReligiousCommunity.create(
        religiousCommunity
      );
      return {
        data: createdCommunity,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  updateReligiousCommunity: async (
    communityId: string,
    religiousCommunity: Partial<IReligiousCommunity>
  ) => {
    try {
      const community = await ReligiousCommunity.findById(communityId);

      if (!community) {
        return {
          error: "Religious Community not found",
          status: false,
        };
      }

      await community.updateOne(religiousCommunity);

      return {
        data: community,
        status: true,
      };
    } catch (error) {
      return {
        error: error,
        status: false,
      };
    }
  },

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
  getRamdom: async (): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      const getRamdomCommunities = await ReligiousCommunity.aggregate([
        { $sample: { size: 9 } },
      ]);

      return {
        data: getRamdomCommunities,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
  getDataFromMaping: async (): Promise<
    ApiResponseType<{
      totalReligiousCommunities: number;
      totalCities: number;
      totalNeighborhoods: number;
    }>
  > => {
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
        data: {
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
        data: aggregateReligiousCommunity,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
  countReligiousCommunitiesByUserId: async (
    userId: string
  ): Promise<
    ApiResponseType<{
      rejected: number;
      pending: number;
      approved: number;
    }>
  > => {
    try {
      const result = await ReligiousCommunity.aggregate([
        { $match: { censusTaker: new Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            rejected: {
              $sum: { $cond: [{ $eq: ["$censusStep", "rejected"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$censusStep", "pending"] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ["$censusStep", "approved"] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            rejected: 1,
            pending: 1,
            approved: 1,
          },
        },
      ]);

      const counts =
        result.length > 0
          ? result[0]
          : { rejected: 0, pending: 0, approved: 0 };

      return {
        status: true,
        data: {
          rejected: counts.rejected,
          pending: counts.pending,
          approved: counts.approved,
        },
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  getReligiousCommunitiesByUserId: async (
    userId: string
  ): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      const response = await ReligiousCommunity.find({
        censusTaker: new Types.ObjectId(userId),
      }).sort({ censusStep: -1 });

      return {
        data: response,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  postUpdateMainPicture: async (id: string, file: any) => {
    try {
      const ext = fileUtils.getFileExtension(file[0].originalname);
      const originalPath = fileUtils.getPublicPath(file[0].filename);

      const filename = `${file[0].filename}.${ext}`;
      fs.renameSync(originalPath, fileUtils.getPublicPath(filename));

      await ReligiousCommunity.updateOne(
        { _id: new Types.ObjectId(id) },
        { $set: { religiousSpaceMainPicture: filename } }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error,
        status: false,
      };
    }
  },
};
