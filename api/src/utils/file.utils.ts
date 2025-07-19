import path from "path";
import fs from "fs";

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
