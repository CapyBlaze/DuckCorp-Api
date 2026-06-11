import type { Request as ExpressRequest } from "express";
import { Body, Controller, Delete, Get, Path, Post, Request, Route, Security, SuccessResponse, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getProductionPerMinute, getPlayerBuildings } from "../services/building.service.js";
import { getMaxStorageCapacity, getPlayerStorages } from "../services/storage.service.js";
import { getPlayerAchievements } from "../services/achievement.service.js";
import { processOfflineProduction } from "../services/duck.service.js";



@Route("player")
@Tags("Player")
export class PlayerController extends Controller {
    @Get("")
    @Security("bearerAuth")
    public async getPlayer(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        
        const [ducksAfterSync, buildings, storages, achievements] = await Promise.all([
            processOfflineProduction(user.id),
            getPlayerBuildings(user.id),
            getPlayerStorages(user.id),
            getPlayerAchievements(user.id),
        ]);

        const [productionPerMinute, maxStorageCapacity] = await Promise.all([
            getProductionPerMinute(user.id),
            getMaxStorageCapacity(user.id),
        ]);
        
        return ApiResponse.success("Player data retrieved", {
            id: user.id,
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: user.money,
            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,

            buildings: buildings,
            storages: storages,
            achievements: achievements
        });
    }


    @Get("sync")
    @Security("bearerAuth")
    public async getPlayerSync(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;

        const ducksAfterSync = await processOfflineProduction(user.id);
        const productionPerMinute = await getProductionPerMinute(user.id);
        const maxStorageCapacity = await getMaxStorageCapacity(user.id);
        
        return ApiResponse.success("Player data synchronized", {
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: user.money,
            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,
        });
    }
}
