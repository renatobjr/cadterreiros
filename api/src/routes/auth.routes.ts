import { Router } from "express";
import authController from "@/api/controllers/auth.controller";
import isAuth from "@/api/middlewares/isAuth";
import {
  authGenerateTokenRateLimit,
  authLoginRateLimit,
  authSetPasswordRateLimit,
  authVerifyOtpRateLimit,
} from "@/api/middlewares/rateLimit";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/auth`;

router.get(
  `${path}/generate-user-token/:email/:isFromForget`,
  authGenerateTokenRateLimit,
  authController.generateUserToken
);
router.post(
  `${path}/set-password`,
  authSetPasswordRateLimit,
  authController.setPassword
);
router.post(
  `${path}/verify-otp`,
  authVerifyOtpRateLimit,
  authController.verifyOTP
);
router.post(`${path}/login`, authLoginRateLimit, authController.login);
router.post(`${path}/logout`, authController.logout);
router.post(`${path}/validate-token`, isAuth, authController.validateToken);

export default router;
