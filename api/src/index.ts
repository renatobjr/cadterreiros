import express, { Router } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import bodyParser from "body-parser";
import handleResponse from "@/api/middlewares/handleResponse";
import { HttpStatusCode } from "./enum/HttpStatusCode.enum";

dotenv.config();

const health = Router();

health.get("/health", (req, res) => {
  return res.success(HttpStatusCode.OK, "OK");
});

const api = express();
api
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(morgan("dev"))
  .use(bodyParser.json())
  .use(handleResponse)
  .use(health);

const API_PORT = process.env.API_PORT || 3001;

api.listen(API_PORT, () => {
  console.log(`[✔] API listening on port ${API_PORT}`);
});
