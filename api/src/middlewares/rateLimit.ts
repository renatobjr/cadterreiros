import type { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 5;

/**
 * Limita a 5 requisições por IP a cada minuto e responde 429 com `Retry-After`
 * (header definido pelo express-rate-limit) quando o limite é excedido.
 *
 * Factory para permitir uma instância isolada (store em memória) por rota/teste.
 */
export const createRateLimit = () =>
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req: Request, res: Response) =>
      res.apiResponse(HttpStatusCode.TOO_MANY_REQUESTS, "Too many requests"),
  });

/** Instância usada pelo `POST /public/create`. */
export const publicCreateRateLimit = createRateLimit();

export default publicCreateRateLimit;
