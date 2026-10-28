import type { CookieOptions, Response } from "express";

/** Nome do cookie de sessão do painel (httpOnly, não acessível ao JS). */
export const SESSION_COOKIE = "cadterreiros_session";

/** Validade da sessão — precisa bater com o `expiresIn` do JWT (8h). */
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

const isProduction = process.env.NODE_ENV === "production";

/**
 * `SameSite=Strict` impede o envio do cookie em navegações vindas de outro
 * site (proteção CSRF). `Secure` só em produção porque o dev roda em http.
 */
export function sessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE_MS,
  };
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    path: "/",
  });
}
