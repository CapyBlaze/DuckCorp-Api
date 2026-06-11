import { Router } from "express";
import { authHandler } from "../middlewares/auth.middleware.js";
import { byDucks, byMoney, byNbBuildings, byNbStorage, byProduction, byStorage } from "../controllers/leaderboard.controller.js";

const router = Router();

router.get("/byDucks", authHandler, byDucks);
router.get("/byMoney", authHandler, byMoney);
router.get("/byProduction", authHandler, byProduction);
router.get("/byStorage", authHandler, byStorage);
router.get("/byNbBuildings", authHandler, byNbBuildings);
router.get("/byNbStorage", authHandler, byNbStorage);


export default router;
