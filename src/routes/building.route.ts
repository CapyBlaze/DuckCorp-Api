import { Router } from "express";
import { authHandler } from "../middlewares/auth.middleware.js";
import { buyBuilding, getBuildingList } from "../controllers/building.controller.js";

const router = Router();

router.get("/list", authHandler, getBuildingList);
router.post("/buy", authHandler, buyBuilding);

export default router;
