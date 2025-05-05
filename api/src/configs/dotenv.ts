import dotenv from "dotenv";

dotenv.config({
  path: ".env",
  override: true,
});

export default process.env;
