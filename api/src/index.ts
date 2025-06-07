import "@/api/configs/dotenv";
import mongoose from "mongoose";
import express, { Router } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import handleResponse from "@/api/middlewares/handleResponse";
import health from "@/api/routes/health";
import ReligiousCommunityRoute from "@/api/routes/religiousCommunity.routes";
import "reflect-metadata";
import initialDataSeed from "./db/initialData.seed";

const api = express();
api
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(morgan("dev"))
  .use(bodyParser.json())
  .use(handleResponse)
  .use(health)
  .use(ReligiousCommunityRoute);

const API_PORT = process.env.API_PORT || 3000;
const MONGO_URL = process.env.MONGO_URL as string;

mongoose
  .connect(MONGO_URL, {
    auth: {
      username: process.env.MONGO_INITDB_ROOT_USERNAME,
      password: process.env.MONGO_INITDB_ROOT_PASSWORD,
    },
    authSource: "admin",
    dbName: process.env.MONGO_INITDB_DATABASE,
  })
  .then(() => {
    console.log("[✔] MongoDB connected");
    api.listen(API_PORT, async () => {
      console.log(`[✔] API listening on port ${API_PORT}`);
      await initialDataSeed();
    });
  });
