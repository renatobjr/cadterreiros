import type { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate, type ValidationError } from "class-validator";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

export interface ValidationFieldError {
  field: string;
  messages: string[];
}

/** Achata as `ValidationError` (inclusive aninhadas) em erros por campo. */
const collectErrors = (
  errors: ValidationError[],
  parent = ""
): ValidationFieldError[] =>
  errors.flatMap((error) => {
    const field = parent ? `${parent}.${error.property}` : error.property;
    const own: ValidationFieldError[] = error.constraints
      ? [{ field, messages: Object.values(error.constraints) }]
      : [];

    return [...own, ...collectErrors(error.children ?? [], field)];
  });

/**
 * Valida `req.body` contra um DTO com class-validator.
 *
 * Payload inválido → 400 com `errors: [{ field, messages }]`.
 * Payload válido → `req.body` recebe a instância sanitizada (whitelist).
 */
export const validateDTO =
  <T extends object>(dtoClass: new () => T) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const instance = plainToInstance(dtoClass, req.body ?? {});
    const errors = await validate(instance, {
      whitelist: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      return res.apiResponse(HttpStatusCode.BAD_REQUEST, {
        message: "Validation failed",
        errors: collectErrors(errors),
      });
    }

    req.body = instance;
    next();
  };

export default validateDTO;
