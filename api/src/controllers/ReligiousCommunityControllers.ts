import { Handler, Request, Response } from "express";
import { IReligiousCommunity } from "@/api/schemas/ReligiousCommunity";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { religiousCommunityService } from "../services/religiousCommunityService";
import { plainToInstance } from "class-transformer";
import { ReligiousCommunityListDTO } from "../dtos/religiousCommunityListDTO";

export const religiousCommunityController = {
  list: async (req: Request, res: Response) => {
    const religiousCommunities = await religiousCommunityService.list();

    if (!religiousCommunities.status) {
      return res.apiResponse<IReligiousCommunity[]>(
        HttpStatusCode.BAD_REQUEST,
        religiousCommunities.error
      );
    }

    return res.apiResponse<IReligiousCommunity[]>(
      HttpStatusCode.OK,
      plainToInstance(ReligiousCommunityListDTO, religiousCommunities.data, {
        excludeExtraneousValues: true,
      })
    );
  },
};
