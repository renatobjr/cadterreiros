import { Router } from "express";
import { religiousCommunityController } from "@/api/controllers/religiousCommunity.controller";
import isAuth from "@/api/middlewares/isAuth";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/religious-communities`;

// Public routes
router.get(`${path}/public/list`, religiousCommunityController.list);
router.get(`${path}/public/random`, religiousCommunityController.getRandom);
router.get(
  `${path}/public/mapping`,
  religiousCommunityController.getDataFromMaping
);
router.get(
  `${path}/public/:id`,
  religiousCommunityController.getPublicCommunityById
);

// Private routes
router.get(
  `${path}/count-religious-communities-by-user-id`,
  isAuth,
  religiousCommunityController.getCountReligiousCommunitiesByUserId
);
router.get(
  `${path}/religious-communities-by-user-id`,
  isAuth,
  religiousCommunityController.getReligiousCommunitiesByUserId
);
router.get(
  `${path}/:id`,
  isAuth,
  religiousCommunityController.getCommunityById
);
router.post(
  `${path}/upload-main-picture/:id`,
  isAuth,
  religiousCommunityController.postUploadMainPicture
);
router.post(
  `${path}/create-religious-community`,
  isAuth,
  religiousCommunityController.createReligiousCommunity
);
router.put(
  `${path}/update-religious-community/:id`,
  isAuth,
  religiousCommunityController.updateReligiousCommunity
);

export default router;
