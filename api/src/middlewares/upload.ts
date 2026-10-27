import multer from "multer";
import path from "path";
import type { NextFunction, Request, Response } from "express";

/** Mesmo diretório usado pelo multer global (`index.ts`) e por `fileUtils`. */
export const UPLOAD_MAIN_PICTURE_DIR = path.join(
  __dirname,
  "..",
  "..",
  "uploads",
  "religiousCommunities"
);

const upload = multer({ dest: UPLOAD_MAIN_PICTURE_DIR }).any();

/**
 * Processa o `multipart/form-data` do upload público de foto.
 *
 * Em produção o multer global de `index.ts` já consumiu o corpo; nesse caso
 * (req.files definido) apenas segue adiante para não reprocessar o stream.
 */
const uploadMainPicture = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.files) {
    return next();
  }

  upload(req, res, next);
};

export default uploadMainPicture;
