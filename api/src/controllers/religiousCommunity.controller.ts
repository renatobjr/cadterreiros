import { Request, Response } from "express";
import { IReligiousCommunity } from "@/api/schemas/ReligiousCommunity";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { religiousCommunityService } from "@/api/services/religiousCommunity.service";
import { ReligiousCommunityListDTO } from "@/api/dtos/religiousCommunityList.DTO";
import { plainToInstance } from "class-transformer";

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
