import { Router } from "express";
import { getVersion, healthCheck } from "../controllers/system.controller.js";

const router = Router();

router.get("/health", healthCheck);
router.get("/version", getVersion);

export default router;
