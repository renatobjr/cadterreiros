import { Request, Response } from "express";
import { IReligiousCommunity } from "@/api/schemas/ReligiousCommunity";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { religiousCommunityService } from "@/api/services/religiousCommunity.service";
import { ReligiousCommunitiesListDTO } from "@/api/dtos/religiousCommunitiesDTOS/religiousCommunitiesList.DTO";
import { plainToInstance } from "class-transformer";
import { ReligiousCommunitiesGetRamdomDTO } from "../dtos/religiousCommunitiesDTOS/religiousCommunitiesGetRamdom.DTO";
import { ReligiousCommunitiesGetByIdDTO } from "../dtos/religiousCommunitiesDTOS/religiousCommunitiesGetById.DTO";

export const religiousCommunityController = {
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const queryParams: any = req.query;
      const response = await religiousCommunityService.list(queryParams);

      res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
        results: plainToInstance(
          ReligiousCommunitiesListDTO,
          response.results,
          {
            excludeExtraneousValues: true,
          }
        ),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, error);
    }
  },
  getRamdom: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getRamdom();

    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }

    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      results: plainToInstance(
        ReligiousCommunitiesGetRamdomDTO,
        response.results,
        {
          excludeExtraneousValues: true,
        }
      ),
      status: response.status,
    });
  },
  getDataFromMaping: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.getDataFromMaping();

    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }

    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      results: response.results,
      status: response.status,
    });
  },
  getCommunityById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const response = await religiousCommunityService.getCommunityById(id);

    res.apiResponse<IReligiousCommunity>(HttpStatusCode.OK, {
      results: plainToInstance(
        ReligiousCommunitiesGetByIdDTO,
        response.results,
        {
          excludeExtraneousValues: true,
        }
      ),
      status: response.status,
    });
  },
};
