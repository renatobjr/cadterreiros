import type { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export const RATE_LIMIT_WINDOW_MS = 60 * 1000;
export const RATE_LIMIT_MAX_REQUESTS = 5;

/**
 * Limita as requisições por IP e responde 429 com `Retry-After` (header
 * definido pelo express-rate-limit) quando o limite é excedido.
 *
 * Factory para permitir uma instância isolada (store em memória) por rota/teste.
 * O padrão é 5/min; rotas de autenticação passam limites próprios.
 */
export const createRateLimit = (
  options: { windowMs?: number; limit?: number } = {}
) =>
  rateLimit({
    windowMs: options.windowMs ?? RATE_LIMIT_WINDOW_MS,
    limit: options.limit ?? RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req: Request, res: Response) =>
      res.apiResponse(HttpStatusCode.TOO_MANY_REQUESTS, "Too many requests"),
  });

/** Instância usada pelo `POST /public/create`. */
export const publicCreateRateLimit = createRateLimit();

/** Instância usada pelo `POST /public/upload-main-picture/:id`. */
export const publicUploadMainPictureRateLimit = createRateLimit();

/**
 * Limites do fluxo de acesso:
 * - login e verificação de código: 10/min (freia força bruta de senha/OTP);
 * - geração de token: 3/min (evita bombardeio de e-mails de recuperação).
 */
export const authLoginRateLimit = createRateLimit({ limit: 10 });
export const authVerifyOtpRateLimit = createRateLimit({ limit: 10 });
export const authSetPasswordRateLimit = createRateLimit({ limit: 10 });
export const authGenerateTokenRateLimit = createRateLimit({ limit: 3 });

export default publicCreateRateLimit;
