import { Router } from "express";
import authController from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/login", authController.login);
authRoutes.post("/validate-token", authController.validateToken);

const router = Router();
let BASE_URL = process.env.NODE_BASE_URL || "/api/v1";

router.use(`${BASE_URL}/auth`, authRoutes);

export default router;
