import { Router } from "express";
import { HttpStatusCode } from "../enum/HttpStatusCode.enum";

const health = Router();

health.get("/", (req, res) => {
  return res.apiResponse(HttpStatusCode.OK, "OK");
});

const router = Router();
let BASE_URL = process.env.NODE_BASE_URL || "/api/v1";
router.use(`${BASE_URL}/health`, health);

export default router;
