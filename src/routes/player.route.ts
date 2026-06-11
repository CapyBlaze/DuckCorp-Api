import { Router } from "express";
import { authHandler } from "../middlewares/auth.middleware.js";
import { getPlayer, getPlayerSync } from "../controllers/player.controller.js";

const router = Router();

router.get("", authHandler, getPlayer);
router.get("/sync", authHandler, getPlayerSync);

export default router;
