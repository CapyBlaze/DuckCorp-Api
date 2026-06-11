import { Router } from "express";
import { authHandler } from "../middlewares/auth.middleware.js";
import { buyStorage, getStorageList } from "../controllers/storage.controller.js";

const router = Router();

router.get("/list", authHandler, getStorageList);
router.post("/buy", authHandler, buyStorage);

export default router;
