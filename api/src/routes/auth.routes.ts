import { Router } from "express";
import authController from "@/api/controllers/auth.controller";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/auth`;

router.post(`${path}/login`, authController.login);
router.post(`${path}/validate-token`, authController.validateToken);

export default router;
