import "reflect-metadata";
import "@/api/configs/dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import handleResponse from "@/api/middlewares/handleResponse";
import health from "@/api/routes/health.routes";
import initialDataSeed from "./db/initialData.seed";
import mongoose from "mongoose";
import morgan from "morgan";
import religiousCommunityRoutes from "@/api/routes/religiousCommunity.routes";
import multer from "multer";
import path from "path";

const api = express();

api
  .use(cors())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(morgan("dev"))
  .use(
    bodyParser.json({
      limit: "50mb",
    })
  )
  .use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
    })
  )
  .use(
    multer({
      dest: path.join(__dirname, "../uploads/religiousCommunities"),
      limits: {
        fieldSize: 1024 * 100,
      },
    }).any()
  )
  .use(express.static(path.join(__dirname, "../uploads")))
  .use(handleResponse)
  .use(health)
  .use(religiousCommunityRoutes);

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
