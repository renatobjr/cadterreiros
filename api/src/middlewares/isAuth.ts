import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";
import { User } from "../schemas/User";
import tokenUtils from "../utils/token.utils";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullname: string;
  role: string;
}

/**
 * Extrai o token do header (`Authorization: Bearer` ou `X-Access-Token`).
 * O cookie de sessão é aceito para o painel web (ver `session.utils`).
 */
function readToken(req: Request): string | null {
  const header =
    (req.headers["x-access-token"] as string) || req.headers.authorization;

  if (typeof header === "string" && header.startsWith("Bearer ")) {
    const token = header.slice("Bearer ".length).trim();
    return token || null;
  }

  const cookieToken = (req as Request & { cookies?: Record<string, string> })
    .cookies?.["cadterreiros_session"];

  return cookieToken || null;
}

/**
 * Exige sessão válida.
 *
 * Verifica a assinatura/expiração do JWT **e** a situação do usuário no banco:
 * token inválido, usuário removido ou desativado respondem 401 e a requisição
 * não segue para o controller.
 */
const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = readToken(req);
    if (!token) {
      return res.apiResponse(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
    }

    const decoded = tokenUtils.verify(token);
    const userId = decoded?.id;
    if (!userId) {
      return res.apiResponse(
        HttpStatusCode.UNAUTHORIZED,
        "Invalid token or expired"
      );
    }

    const user = await User.findById(userId).select(
      "_id email fullname role isEnabled"
    );
    if (!user || !user.isEnabled) {
      return res.apiResponse(
        HttpStatusCode.UNAUTHORIZED,
        "Invalid token or expired"
      );
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    } satisfies AuthenticatedUser;

    return next();
  } catch {
    return res.apiResponse(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
  }
};

export default isAuth;
