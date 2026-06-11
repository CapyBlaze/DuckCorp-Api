import { Router } from "express";
import { authHandler } from "../middlewares/auth.middleware.js";
import { sellDucks, getMarketPrice, priceHistoryChart } from "../controllers/market.controller.js";

const router = Router();

router.get("/", authHandler, getMarketPrice);
router.get("/sell", authHandler, sellDucks);
router.get("/price-history", authHandler, priceHistoryChart);


export default router;
