import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";
import tokenUtils from "../utils/token.utils";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authToken =
      (req.headers["x-access-token"] as string) || req.headers.authorization;
    if (!authToken || !authToken.startsWith("Bearer ")) {
      return res.apiResponse(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
    }

    const token = authToken.split(" ")[1];
    if (!token) {
      return res.apiResponse(HttpStatusCode.UNAUTHORIZED, "Missed token");
    }

    let decodedToken;
    try {
      decodedToken = await tokenUtils.verify(token);
    } catch (error) {
      res.apiResponse(HttpStatusCode.UNAUTHORIZED, "Invalid token or expired");
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    res.apiResponse(HttpStatusCode.BAD_REQUEST, error);
  }
};

export default isAuth;
