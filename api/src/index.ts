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
import path from "path";

import health from "@/api/routes/health.routes";
import religiousCommunityRoutes from "@/api/routes/religiousCommunity.routes";
import authPublicRoutes from "@/api/routes/auth.routes";
import usersRoutes from "@/api/routes/users.route";
import { corsOrigins, isAllowedOrigin } from "./configs/cors";

/**
 * Origens que podem falar com a API carregando o cookie de sessão.
 * Configurável por `WEB_ORIGIN`; em desenvolvimento qualquer porta local vale.
 */
const allowedOrigins = corsOrigins();

const api = express();

// Atrás do proxy/load balancer o IP real vem no X-Forwarded-For; sem isso o
// rate limit contaria todo mundo como um único cliente.
if (process.env.NODE_ENV === "production") {
  api.set("trust proxy", 1);
}

api
  .use(
    cors({
      // Cookie de sessão exige origem explícita (não pode ser "*").
      origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
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
  .use((_req, res, next) => {
    // Cabeçalhos de defesa em profundidade (a SPA é servida pelo proxy).
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  })
  .use(cookieParser())
  .use(requireTrustedOrigin())
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
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
  /* Uploads só são gravados nas rotas de foto (multer por rota, depois de
     autenticação/rate limit). `nosniff` impede que um arquivo seja
     reinterpretado como HTML pela origem do painel. */
  .use(
    express.static(path.join(__dirname, "../uploads"), {
      setHeaders: (response) => {
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Disposition", "inline");
      },
    })
  )
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
