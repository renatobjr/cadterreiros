import { Request, Response } from "express";
import { usersService } from "@/api/services/users.service";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { IUser } from "@/api/schemas/User";
import { plainToInstance } from "class-transformer";
import { UsersListDTO } from "../dtos/usersDTO/usersList.DTO";

export const usersController = {
  list: async (req: Request, res: Response): Promise<void> => {
    const response = await usersService.list();

    if (!response.status) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, response.error);
    }

    res.apiResponse<IUser[]>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(UsersListDTO, response.data, {
        excludeExtraneousValues: true,
      }),
      status: response.status,
    });
  },
};
