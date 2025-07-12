import "reflect-metadata";
import "@/api/configs/dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import handleResponse from "@/api/middlewares/handleResponse";
import initialDataSeed from "./db/initialData.seed";
import mongoose from "mongoose";
import morgan from "morgan";
import multer from "multer";
import path from "path";

import health from "@/api/routes/health.routes";
import religiousCommunityRoutes from "@/api/routes/religiousCommunity.routes";
import authPublicRoutes from "@/api/routes/auth.routes";

const api = express();

api
  .use(
    cors({
      origin: "*",
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
        "Authorization",
      ],
    })
  )
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
    }).any()
  )
  .use(express.static(path.join(__dirname, "../uploads")))
  .use(handleResponse)
  .use(health)
  .use(authPublicRoutes)
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
