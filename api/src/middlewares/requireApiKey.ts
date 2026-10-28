import type { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export const API_KEY_HEADER = "x-cadterreiros-api";

/**
 * Exige o header `x-cadterreiros-api` com o valor fixo do ambiente,
 * definido em `CADTERREIROS_API_KEY`.
 *
 * Ausente, inválido ou sem env configurada → 403 (fail-closed).
 */
const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  const expectedApiKey = process.env.CADTERREIROS_API_KEY;
  const providedApiKey = req.headers[API_KEY_HEADER];

  if (!expectedApiKey || providedApiKey !== expectedApiKey) {
    return res.apiResponse(HttpStatusCode.FORBIDDEN, "Forbidden");
  }

  next();
};

export default requireApiKey;
