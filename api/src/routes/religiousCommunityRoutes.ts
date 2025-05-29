import { Router } from "express";
import { religiousCommunityController } from "@/api/controllers/ReligiousCommunityControllers";

const religiousCommunityRoutes = Router();

religiousCommunityRoutes.get("/", religiousCommunityController.list);

const router = Router();
let BASE_URL = process.env.NODE_BASE_URL || "/api/v1";
router.use(`${BASE_URL}/terreiros`, religiousCommunityRoutes);

export default router;
