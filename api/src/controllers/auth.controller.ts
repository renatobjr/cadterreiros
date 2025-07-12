import { Handler, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";
import { authService } from "../services/auth.service";
import { plainToInstance } from "class-transformer";
import { AuthLoginDTO } from "../dtos/authDTOS/authLogin.DTO";
import { IUser } from "../schemas/User";

const login: Handler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const response = await authService.login(email, password);
    res.apiResponse<IUser>(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(AuthLoginDTO, response.data, {
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
};

const validateToken: Handler = async (req: Request, res: Response) => {
  try {
    const reqToken =
      (req.headers["x-access-token"] as string) || req.headers.authorization;

    const token = reqToken?.split(" ")[1] || "";

    const response = await authService.validateToken(token);
    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: plainToInstance(AuthLoginDTO, response.data, {
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
};

export default {
  login,
  validateToken,
};
