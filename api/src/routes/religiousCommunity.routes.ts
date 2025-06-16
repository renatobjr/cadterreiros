import { Router } from "express";
import { religiousCommunityController } from "@/api/controllers/religiousCommunity.controller";

const religiousCommunityRoutes = Router();

religiousCommunityRoutes.get("/", religiousCommunityController.list);
religiousCommunityRoutes.get("/ramdom", religiousCommunityController.getRamdom);
religiousCommunityRoutes.get(
  "/maping",
  religiousCommunityController.getDataFromMaping
);
religiousCommunityRoutes.get(
  "/:id",
  religiousCommunityController.getCommunityById
);

const router = Router();
let BASE_URL = process.env.NODE_BASE_URL || "/api/v1";

router.use(`${BASE_URL}/religiousCommunities`, religiousCommunityRoutes);

export default router;
