import { Router } from "express";
import isAuth from "../middlewares/isAuth";
import { requireAdmin } from "../middlewares/requireRole";
import { usersController } from "../controllers/users.controller";
import { privateReadRateLimit } from "../middlewares/rateLimit";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/users`;

router.use(privateReadRateLimit);

router.get(`${path}/list`, isAuth, requireAdmin, usersController.list);
router.get(`${path}/list-all`, isAuth, requireAdmin, usersController.listAll);
router.put(`${path}/set-user-status`, isAuth, requireAdmin, usersController.setUserStatus);
router.put(`${path}/change-user-role`, isAuth, requireAdmin, usersController.changeUserRole);
router.post(`${path}/add-user`, isAuth, requireAdmin, usersController.addUser);

export default router;
