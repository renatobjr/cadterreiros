import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";
import tokenUtils from "../utils/token.utils";

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      res.apiResponse<Error>(HttpStatusCode.UNAUTHORIZED, {
        message: "Unauthorized",
      });
    }

    let token = req.headers?.authorization?.split(" ")[1];

    if (token) {
      let decodedToken = tokenUtils.verify(token);
      console.log(decodedToken);
    }
  } catch (error) {
    res.apiResponse(HttpStatusCode.BAD_REQUEST, error);
  }
};
