import { Router } from "express";
import isAuth from "../middlewares/isAuth";
import { usersController } from "../controllers/users.controller";

const router = Router();
const basePath = process.env.NODE_BASE_URL || "/api/v1";
const path = `${basePath}/users`;

router.get(`${path}/list`, isAuth, usersController.list);
router.get(`${path}/list-all`, isAuth, usersController.listAll);
router.put(`${path}/set-user-status`, isAuth, usersController.setUserStatus);
router.put(`${path}/change-user-role`, isAuth, usersController.changeUserRole);
router.post(`${path}/add-user`, isAuth, usersController.addUser);

export default router;
