import { Router } from "express";
import { religiousCommunityController } from "@/api/controllers/religiousCommunity.controller";
import isAuth from "@/api/middlewares/isAuth";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/religious-communities`;

router.get(`${path}/list`, religiousCommunityController.list);
router.get(`${path}/random`, religiousCommunityController.getRamdom);
router.get(`${path}/mapping`, religiousCommunityController.getDataFromMaping);
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
router.get(`${path}/:id`, religiousCommunityController.getCommunityById);

router.post(
  `${path}/upload-main-picture/:id`,
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
