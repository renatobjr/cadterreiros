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
  censusStep?: ECensusStep;
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
          { religiousSpaceName: { $regex: searchValue, $options: "i" } },
          {
            "communityAddress.neighborhood": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            "communityAddress.city": {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            religiousSpaceNation: {
              $regex: searchValue,
              $options: "i",
            },
          },
          {
            communityType: {
              $regex: searchValue,
              $options: "i",
            },
          },
        ];

        if (isYear) {
          orConditions.push({
            religiousSpaceYearFoundation: parseInt(searchValue, 10),
          });
        }

        const user = await User.findOne({
          fullname: { $regex: searchValue, $options: "i" },
        });

        if (user) {
          orConditions.push({ censusTaker: user._id });
        }

        searchTerm = { $or: orConditions };
      }

      if (options.censusStep !== undefined) {
        if (Object.keys(searchTerm).length === 0) {
          searchTerm = { censusStep: options.censusStep };
        } else {
          searchTerm = {
            $and: [searchTerm, { censusStep: options.censusStep }],
          };
        }
      }

      const religiousCommunities = await ReligiousCommunity.aggregate([
        {
          $match: searchTerm,
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

  getRandom: async (): Promise<ApiResponseType<IReligiousCommunity[]>> => {
    try {
      const getRamdomCommunities = await ReligiousCommunity.aggregate([
        { $sample: { size: 9 } },
      ]);

      return {
        data: getRamdomCommunities,
        status: true,
      };
    } catch (error: any) {
      console.log(error);
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
            _id: "$communityAddress.city",
          },
        },
        {
          $count: "total",
        },
      ]);

      const totalNeighborhoods = await ReligiousCommunity.aggregate([
        {
          $group: {
            _id: "$communityAddress.neighborhood",
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

  postUpdateMainPicture: async (
    id: string,
    file: any
  ): Promise<Record<string, boolean | string>> => {
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
        error: error as string,
        status: false,
      };
    }
  },

  assignOwner: async (
    communityId: string,
    userId: string,
    keepStatus: boolean
  ): Promise<Record<string, boolean | string>> => {
    console.log({
      keepStatus,
    });
    try {
      const updatedComnunity: any = {
        censusTaker: new Types.ObjectId(userId),
      };

      if (!keepStatus) {
        updatedComnunity.censusStep = ECensusStep.PENDING;
      }

      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: updatedComnunity,
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  setCensusStep: async (
    communityId: string,
    step: ECensusStep,
    rejectedReason?: string
  ): Promise<Record<string, boolean | string>> => {
    try {
      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: step,
            rejectedReason: rejectedReason,
          },
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  requestCorrections: async (
    communityId: string,
    userId: string,
    rejectedReason: string
  ) => {
    try {
      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: ECensusStep.REJECTED,
            censusTaker: new Types.ObjectId(userId),
            rejectedReason: rejectedReason,
          },
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  approveCensus: async (communityId: string) => {
    try {
      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: ECensusStep.APPROVED,
            rejectedReason: undefined,
          },
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },

  rejectCensus: async (communityId: string, rejectedReason: string) => {
    try {
      await ReligiousCommunity.findOneAndUpdate(
        { _id: new Types.ObjectId(communityId) },
        {
          $set: {
            censusStep: ECensusStep.REJECTED,
            rejectedReason: rejectedReason,
          },
        }
      );

      return {
        data: true,
        status: true,
      };
    } catch (error) {
      return {
        error: error as string,
        status: false,
      };
    }
  },
};
