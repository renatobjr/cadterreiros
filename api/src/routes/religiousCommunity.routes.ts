import { Router } from "express";
import { religiousCommunityController } from "@/api/controllers/religiousCommunity.controller";
import isAuth from "@/api/middlewares/isAuth";
import {
  publicCreateRateLimit,
  publicUploadMainPictureRateLimit,
} from "@/api/middlewares/rateLimit";
import uploadMainPicture from "@/api/middlewares/upload";
import requireApiKey from "@/api/middlewares/requireApiKey";
import { validateDTO } from "@/api/middlewares/validateDTO";
import { ReligiousCommunityCreateDTO } from "@/api/dtos/religiousCommunitiesDTOS/religiousCommunitiesCreate.DTO";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/religious-communities`;

// Public routes
router.post(
  `${path}/public/create`,
  publicCreateRateLimit,
  requireApiKey,
  validateDTO(ReligiousCommunityCreateDTO),
  religiousCommunityController.createPublicReligiousCommunity
);
router.get(`${path}/public/list`, religiousCommunityController.list);
router.get(`${path}/public/oldest`, religiousCommunityController.getOldest);
router.get(`${path}/public/random`, religiousCommunityController.getRandom);
router.get(
  `${path}/public/mapping`,
  religiousCommunityController.getDataFromMaping
);
router.get(
  `${path}/public/stats/summary`,
  religiousCommunityController.getStatsSummary
);
router.get(
  `${path}/public/stats/by-nation`,
  religiousCommunityController.getStatsByNation
);
router.get(
  `${path}/public/stats/by-city`,
  religiousCommunityController.getStatsByCity
);
router.get(
  `${path}/public/stats/by-decade`,
  religiousCommunityController.getStatsByDecade
);
router.get(
  `${path}/public/stats/by-type-and-nation`,
  religiousCommunityController.getStatsByTypeAndNation
);
router.get(
  `${path}/public/stats/by-type`,
  religiousCommunityController.getStatsByType
);
router.get(
  `${path}/public/stats/by-leader-gender`,
  religiousCommunityController.getStatsByLeaderGender
);
router.get(
  `${path}/public/stats/by-leader-ethnicity`,
  religiousCommunityController.getStatsByLeaderEthnicity
);
router.get(
  `${path}/public/stats/by-language`,
  religiousCommunityController.getStatsByLanguage
);
router.get(
  `${path}/public/stats/by-neighborhood`,
  religiousCommunityController.getStatsByNeighborhood
);
router.get(
  `${path}/public/stats/photo-coverage`,
  religiousCommunityController.getStatsByPhotoCoverage
);
router.get(
  `${path}/public/:id`,
  religiousCommunityController.getPublicCommunityById
);
router.post(
  `${path}/public/upload-main-picture/:id`,
  publicUploadMainPictureRateLimit,
  requireApiKey,
  uploadMainPicture,
  religiousCommunityController.postPublicUploadMainPicture
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
router.get(`${path}/list`, isAuth, religiousCommunityController.list);
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
router.put(
  `${path}/assign-owner`,
  isAuth,
  religiousCommunityController.assignOwner
);
router.put(
  `${path}/set-census-step`,
  isAuth,
  religiousCommunityController.setCensusStep
);
router.put(
  `${path}/request-corrections`,
  isAuth,
  religiousCommunityController.requestCorrections
);
router.put(
  `${path}/approve-census`,
  isAuth,
  religiousCommunityController.approveCensus
);
router.put(
  `${path}/reject-census`,
  isAuth,
  religiousCommunityController.rejectCensus
);
// Get id
router.get(
  `${path}/:id`,
  isAuth,
  religiousCommunityController.getCommunityById
);

export default router;
