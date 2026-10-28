import path from "path";
import fs from "fs";

/** Extensões aceitas — derivadas do conteúdo, nunca do nome enviado. */
export type SafeImageExtension = "jpg" | "png" | "webp" | "gif";

/**
 * Confere os primeiros bytes do arquivo. O `Content-Type` do multipart é
 * controlado pelo cliente; sem isso um `.html` com MIME de imagem seria
 * gravado e servido na mesma origem do painel (XSS armazenado).
 */
export function detectImageExtension(buffer: Buffer): SafeImageExtension | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpg";
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    )
  ) {
    return "png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  if (buffer.length >= 6 && buffer.subarray(0, 3).toString("ascii") === "GIF") {
    return "gif";
  }
  return null;
}

const fileUtils = {
  read: async (path: string, encoding?: BufferEncoding) => {
    const content = await fs.promises.readFile(path);
    return content.toString(encoding);
  },
  getFileExtension: (filename: string): string => {
    return filename?.split(".").pop() || "";
  },

  getPublicPath: (filename: string): string => {
    return path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      "religiousCommunities",
      filename
    );
  },
};

export default fileUtils;
