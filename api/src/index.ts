import "reflect-metadata";
import "@/api/configs/dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import requireTrustedOrigin from "./middlewares/requireTrustedOrigin";
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
import usersRoutes from "@/api/routes/users.route";

/**
 * Origens que podem falar com a API carregando o cookie de sessão.
 * Configurável por `WEB_ORIGIN` (lista separada por vírgula).
 */
const allowedOrigins = (
  process.env.WEB_ORIGIN ??
  "http://localhost:5174,http://127.0.0.1:5174"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const api = express();

api
  .use(
    cors({
      // Cookie de sessão exige origem explícita (não pode ser "*").
      origin: allowedOrigins,
      credentials: true,
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
        "Authorization",
        "x-cadterreiros-api",
      ],
    })
  )
  .use(cookieParser())
  .use(requireTrustedOrigin(allowedOrigins))
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
      // Limite e tipo também no parser global: o corpo multipart é consumido
      // aqui antes dos middlewares de rota.
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, done) => {
        if (file.mimetype?.startsWith("image/")) return done(null, true);
        return done(new Error("Apenas imagens são aceitas"));
      },
    }).any()
  )
  .use(express.static(path.join(__dirname, "../uploads")))
  .use(handleResponse)
  .use(health)
  .use(authPublicRoutes)
  .use(religiousCommunityRoutes)
  .use(usersRoutes);

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
