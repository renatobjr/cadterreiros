import { Handler, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";
import { authService } from "../services/auth.service";
import { plainToInstance } from "class-transformer";
import { AuthLoginDTO } from "../dtos/authDTOS/authLogin.DTO";
import { IUser } from "../schemas/User";
import castUtils from "../utils/cast.utils";
import { clearSessionCookie, setSessionCookie } from "../configs/session";

const login: Handler = async (req: Request, res: Response) => {
  try {
    const { email, password, origin } = req.body;
    const response = await authService.login(email, password, origin);
    const session = plainToInstance(AuthLoginDTO, response.data, {
      excludeExtraneousValues: true,
    }) as { token?: string; user?: unknown } | undefined;

    // O token vai apenas no cookie httpOnly; o corpo devolve só o usuário.
    if (response.status && session?.token) {
      setSessionCookie(res, session.token);
    }

    res.apiResponse<IUser>(HttpStatusCode.OK, {
      error: response?.error,
      data: session ? { user: session.user } : undefined,
      status: response.status,
    });
  } catch (error) {
    res.apiResponse(HttpStatusCode.BAD_REQUEST, {
      error: error,
      status: false,
    });
  }
};

const logout: Handler = async (_req: Request, res: Response) => {
  clearSessionCookie(res);
  res.apiResponse(HttpStatusCode.OK, { status: true });
};

const generateUserToken: Handler = async (req: Request, res: Response) => {
  try {
    const { email, isFromForget } = req.params;
    const isForget = castUtils.stringToBoolean(isFromForget);

    const response = await authService.generateUserToken(email, isForget);
    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  } catch (error) {
    res.apiResponse(HttpStatusCode.BAD_REQUEST, {
      error: error,
      status: false,
    });
  }
};

const verifyOTP: Handler = async (req: Request, res: Response) => {
  try {
    const { token, otp } = req.body;
    const response = await authService.verifyOTP(token, otp);
    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      // `AuthLoginDTO` remove o hash da senha e devolve `{ user, token }`.
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

const setPassword: Handler = async (req: Request, res: Response) => {
  try {
    const { token, password, fullname } = req.body;
    const response = await authService.setPassword(token, password, fullname);
    res.apiResponse(HttpStatusCode.OK, {
      error: response?.error,
      data: response.data,
      status: response.status,
    });
  } catch (error) {
    res.apiResponse(HttpStatusCode.BAD_REQUEST, {
      error: error,
      status: false,
    });
  }
};

/**
 * Devolve a sessão atual (cookie httpOnly ou header). O `isAuth` já carregou o
 * usuário e validou `isEnabled`, então basta responder — sem expor o token.
 */
const validateToken: Handler = async (req: Request, res: Response) => {
  res.apiResponse(HttpStatusCode.OK, {
    data: { user: req.user },
    status: true,
  });
};

export default {
  login,
  logout,
  generateUserToken,
  validateToken,
  verifyOTP,
  setPassword,
};
