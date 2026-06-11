import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { getProductionPerMinute, getPlayerBuildings } from "../services/building.service.js";
import { getMaxStorageCapacity, getPlayerStorages } from "../services/storage.service.js";
import { getPlayerAchievements } from "../services/achievement.service.js";
import { processOfflineProduction } from "../services/duck.service.js";


export const getPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        
        const buildings = await getPlayerBuildings(user.id);
        const storages = await getPlayerStorages(user.id);
        const achievements = await getPlayerAchievements(user.id);

        const ducksAfterSync = await processOfflineProduction(user.id);
        const productionPerMinute = await getProductionPerMinute(user.id);
        const maxStorageCapacity = await getMaxStorageCapacity(user.id);
        
        return ApiResponse.success(res,
            "Player data retrieved",
            {
                id: user.id,
                ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
                money: user.money,
                productionPerMinute: productionPerMinute,
                maxStorageCapacity: maxStorageCapacity,

                buildings: buildings,
                storages: storages,
                achievements: achievements
            },
            200
        );

    } catch (error) {
        next(error);
    }
};

export const getPlayerSync = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        const ducksAfterSync = await processOfflineProduction(user.id);
        const productionPerMinute = await getProductionPerMinute(user.id);
        const maxStorageCapacity = await getMaxStorageCapacity(user.id);
        
        return ApiResponse.success(res,
            "Player data synchronized",
            {
                ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
                money: user.money,
                productionPerMinute: productionPerMinute,
                maxStorageCapacity: maxStorageCapacity,
            },
            200
        );

    } catch (error) {
        next(error);
    }
};