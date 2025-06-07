import { Request, Response } from "express";
import { usersService } from "@/api/services/users.service";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { IUser } from "@/api/schemas/User";

export const usersController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const response = await usersService.list();

    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }

    res.apiResponse<IUser[]>(HttpStatusCode.OK, {
      data: response.data,
      status: response.status,
    });
  },
};
