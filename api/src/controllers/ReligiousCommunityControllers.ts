import { Request, Response } from "express";
import { IReligiousCommunity } from "@/api/schemas/ReligiousCommunity";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { religiousCommunityService } from "../services/religiousCommunityService";
import { plainToInstance } from "class-transformer";
import { ReligiousCommunityListDTO } from "../dtos/religiousCommunityListDTO";

export const religiousCommunityController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const response = await religiousCommunityService.list();

    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }

    res.apiResponse<IReligiousCommunity[]>(HttpStatusCode.OK, {
      data: plainToInstance(ReligiousCommunityListDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },
};
