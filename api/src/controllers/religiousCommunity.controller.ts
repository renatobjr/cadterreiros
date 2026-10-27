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

  getOldest: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getOldest();

    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(ReligiousCommunitiesGetRamdomDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },

  getStatsSummary: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsSummary();

    res.apiResponse<{
      totalReligiousCommunities: number;
      totalCities: number;
      totalNeighborhoods: number;
    }>(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByNation: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsByNation();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByCity: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsByCity();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByDecade: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsByDecade();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByTypeAndNation: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response =
      await religiousCommunityService.getStatsByTypeAndNation();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByType: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsByType();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByLeaderGender: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response = await religiousCommunityService.getStatsByLeaderGender();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByLeaderEthnicity: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response =
      await religiousCommunityService.getStatsByLeaderEthnicity();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByLanguage: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsByLanguage();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByNeighborhood: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response = await religiousCommunityService.getStatsByNeighborhood();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByPhotoCoverage: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response = await religiousCommunityService.getStatsByPhotoCoverage();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByCensusStep: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response = await religiousCommunityService.getStatsByCensusStep();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByStatus: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getStatsByStatus();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsByEducationalLevel: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response =
      await religiousCommunityService.getStatsByEducationalLevel();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsBioCoverage: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response = await religiousCommunityService.getStatsBioCoverage();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getStatsVoluntaryRegistrations: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const response =
      await religiousCommunityService.getStatsVoluntaryRegistrations();

    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  getPublicCommunityById: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const response = await religiousCommunityService.getCommunityById(id, {
      approvedOnly: true,
    });

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
      data: response.data,
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

  createPublicReligiousCommunity: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const community = req.body as Partial<IReligiousCommunity>;
    const response =
      await religiousCommunityService.createPublicReligiousCommunity(community);

    const created = response.data as
      | (IReligiousCommunity & {
          _id?: unknown;
          toObject?: () => Record<string, unknown>;
        })
      | undefined;
    const data = created
      ? {
          id: String(created._id ?? (created as { id?: string }).id),
          ...(created.toObject ? created.toObject() : {}),
        }
      : undefined;

    return res.apiResponse(
      response.status
        ? HttpStatusCode.CREATED
        : HttpStatusCode.INTERNAL_SERVER_ERROR,
      {
        error: response?.error,
        data,
        status: response.status,
      }
    );
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

  /** Upload público de foto: mesma regra do privado, sem exigir sessão. */
  postPublicUploadMainPicture: async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) {
      return res.apiResponse(HttpStatusCode.BAD_REQUEST, "No files uploaded");
    }
    return religiousCommunityController.postUploadMainPicture(req, res);
  },

  assignOwner: async (req: Request, res: Response): Promise<void> => {
    const { communityId, userId, keepStatus } = req.body;

    const response = await religiousCommunityService.assignOwner(
      communityId,
      userId,
      keepStatus
    );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  setCensusStep: async (req: Request, res: Response): Promise<void> => {
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

  requestCorrections: async (req: Request, res: Response): Promise<void> => {
    const { communityId, userId, rejectedReason } = req.body;
    const response = await religiousCommunityService.requestCorrections(
      communityId,
      userId,
      rejectedReason
    );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  approveCensus: async (req: Request, res: Response): Promise<void> => {
    const { communityId } = req.body;
    const response = await religiousCommunityService.approveCensus(communityId);
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },

  rejectCensus: async (req: Request, res: Response): Promise<void> => {
    const { communityId, rejectedReason } = req.body;
    const response = await religiousCommunityService.rejectCensus(
      communityId,
      rejectedReason
    );
    return res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  },
};
