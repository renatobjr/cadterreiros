import path from "path";

const fileUtils = {
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
