import { Router } from "express";
import authRouter from "./auth.route.js";
import buildingRouter from "./building.route.js";
import storageRouter from "./storage.route.js";
import playerRouter from "./player.route.js";
import systemRouter from "./system.route.js";
import marketRouter from "./market.route.js";
import leaderboardRouter from "./leaderboard.route.js";


const router = Router();

router.use("/auth", authRouter);
router.use("/building", buildingRouter);
router.use("/storage", storageRouter);
router.use("/player", playerRouter);
router.use("/system", systemRouter);
router.use("/market", marketRouter);
router.use("/leaderboard", leaderboardRouter);

export default router;
