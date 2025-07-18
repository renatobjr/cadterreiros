import { Router } from "express";
import isAuth from "../middlewares/isAuth";
import { usersController } from "../controllers/users.controller";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/users`;

router.get(`${path}/list`, isAuth, usersController.list);

export default router;
