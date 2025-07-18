import { Request, Response } from "express";
import { IReligiousCommunity } from "@/api/schemas/ReligiousCommunity";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { religiousCommunityService } from "@/api/services/religiousCommunity.service";
import { ReligiousCommunitiesListDTO } from "@/api/dtos/religiousCommunitiesDTOS/religiousCommunitiesList.DTO";
import { plainToInstance } from "class-transformer";
import { ReligiousCommunitiesGetRamdomDTO } from "../dtos/religiousCommunitiesDTOS/religiousCommunitiesGetRamdom.DTO";
import { ReligiousCommunitiesGetByIdDTO } from "../dtos/religiousCommunitiesDTOS/religiousCommunitiesGetById.DTO";
import { ReligiousCommunitiesGetByUserIdDTO } from "../dtos/religiousCommunitiesDTOS/religiousCommunitiesGetByUserId.DTO";
import { ReligiousCommunitiesGetByAllPropsDTO } from "../dtos/religiousCommunitiesDTOS/religiousCommunitiesGetAllProps.DTO";

export const religiousCommunityController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const queryParams: any = req.query;
    const response = await religiousCommunityService.list(queryParams);

    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(ReligiousCommunitiesListDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },

  getRandom: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getRandom();
    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }
    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(ReligiousCommunitiesGetRamdomDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },

  getDataFromMaping: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getDataFromMaping();
    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }
    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      error: response?.error,
      results: response.data,
      status: response.status,
    });
  },

  getPublicCommunityById: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const response = await religiousCommunityService.getCommunityById(id);

    res.apiResponse<IReligiousCommunity>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(ReligiousCommunitiesGetByIdDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },

  getCountReligiousCommunitiesByUserId: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response =
      await religiousCommunityService.countReligiousCommunitiesByUserId(
        req.user.id
      );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response,
      status: response.status,
    });
  },

  getCommunityById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const response = await religiousCommunityService.getCommunityById(id);

    res.apiResponse<IReligiousCommunity>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(
        ReligiousCommunitiesGetByAllPropsDTO,
        response.data,
        {
          excludeExtraneousValues: true,
        }
      ),
      status: response.status,
    });
  },

  getReligiousCommunitiesByUserId: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response =
      await religiousCommunityService.getReligiousCommunitiesByUserId(
        req.user.id
      );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(ReligiousCommunitiesGetByUserIdDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },

  createReligiousCommunity: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const community = req.body as IReligiousCommunity;
    const { id } = req.user;

    const response = await religiousCommunityService.createReligiousCommunity(
      community,
      id
    );

    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  updateReligiousCommunity: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const community = req.body as IReligiousCommunity;

    const response = await religiousCommunityService.updateReligiousCommunity(
      id,
      community
    );

    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  postUploadMainPicture: async (req: Request, res: Response): Promise<void> => {
    if (!req.files) {
      return res.apiResponse(HttpStatusCode.BAD_REQUEST, "No files uploaded");
    }
    const response = await religiousCommunityService.postUpdateMainPicture(
      req.params.id,
      req.files
    );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  assignOwner: async (req: Request, res: Response): Promise<void> => {
    const { communityId, userId } = req.body;
    console.log(communityId, userId);

    const response = await religiousCommunityService.assignOwner(
      communityId,
      userId
    );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  setCensusStep: async (req: Request, res: Response): Promise<void> => {
    console.log(req.body);
    const { communityId, step, rejectedReason } = req.body;
    const response = await religiousCommunityService.setCensusStep(
      communityId,
      step,
      rejectedReason
    );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },
};
