import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

/**
 * Defesa extra contra CSRF: rejeita escrita (POST/PUT/PATCH/DELETE) quando o
 * `Origin` declarado não está na allowlist. O `SameSite=Strict` do cookie já
 * bloqueia o caso comum; esta checagem cobre navegadores/edge cases.
 *
 * Requisições sem `Origin` (curl, serviços) seguem — elas não carregam cookie
 * de navegador e dependem do header `Authorization`.
 */
export const requireTrustedOrigin = (allowedOrigins: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const method = req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return next();
    }

    const origin = req.headers.origin;
    if (!origin) return next();

    if (!allowedOrigins.includes(origin)) {
      return res.apiResponse(HttpStatusCode.FORBIDDEN, "Forbidden");
    }

    return next();
  };

export default requireTrustedOrigin;
