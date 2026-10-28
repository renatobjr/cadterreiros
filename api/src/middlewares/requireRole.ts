import { NextFunction, Request, Response } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";
import { ERole } from "../schemas/User";

/**
 * Restringe a rota aos papéis informados. Usar sempre **depois** de `isAuth`.
 *
 * Ex.: `router.put("/approve", isAuth, requireRole(ERole.ADMIN), handler)`.
 */
export const requireRole =
  (...roles: ERole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!req.user) {
      return res.apiResponse(HttpStatusCode.UNAUTHORIZED, "Unauthorized");
    }

    if (!role || !roles.includes(role as ERole)) {
      return res.apiResponse(HttpStatusCode.FORBIDDEN, "Forbidden");
    }

    return next();
  };

/** Atalho para o papel de curadoria. */
export const requireAdmin = requireRole(ERole.ADMIN);

export default requireRole;
