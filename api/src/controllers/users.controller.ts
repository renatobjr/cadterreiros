import { Request, Response } from "express";
import { usersService } from "@/api/services/users.service";
import { HttpStatusCode } from "@/api/enum/HttpStatusCode.enum";
import { IUser } from "@/api/schemas/User";
import { plainToInstance } from "class-transformer";
import { UsersListDTO } from "../dtos/usersDTO/usersList.DTO";

export const usersController = {
  list: async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await usersService.list();
      res.apiResponse<IUser[]>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  listAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const response = await usersService.listAll();
      res.apiResponse<IUser[]>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  setUserStatus: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, status } = req.body;
      const response = await usersService.setUserStatus(id, status);
      res.apiResponse<IUser>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  changeUserRole: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, role } = req.body;
      const response = await usersService.changeUserRole(id, role);
      res.apiResponse<IUser>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },

  addUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, role } = req.body;
      const response = await usersService.addUser(email, role);
      res.apiResponse<IUser>(HttpStatusCode.OK, {
        error: response?.error,
        data: plainToInstance(UsersListDTO, response.data, {
          excludeExtraneousValues: true,
        }),
        status: response.status,
      });
    } catch (error) {
      res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        error: error,
        status: false,
      });
    }
  },
};
