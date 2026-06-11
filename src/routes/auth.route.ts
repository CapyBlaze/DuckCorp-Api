import { Router } from "express";
import { getProfile, register, getPlayer, deleteProfile } from "../controllers/auth.controller.js";
import { authHandler } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.get("/me",         authHandler, getProfile);
router.get("/player/:id", authHandler, getPlayer);
router.delete("/me",      authHandler, deleteProfile);

export default router;
