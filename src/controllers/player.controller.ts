import type { Request as ExpressRequest } from "express";
import {Controller, Get, Post, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getProductionPerMinute, getPlayerBuildings } from "../services/building.service.js";
import { getMaxStorageCapacity, getPlayerStorages } from "../services/storage.service.js";
import { getPlayerAchievements } from "../services/achievement.service.js";
import { processOfflineProduction } from "../services/duck.service.js";



@Route("player")
@Tags("Player")
export class PlayerController extends Controller {
    /** Get player data */
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


    /** Synchronize player data (process offline production) */
    @Post("sync")
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


    /** Get player buildings */
    @Get("buildings")
    @Security("bearerAuth")
    public async getPlayerBuildings(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const buildings = await getPlayerBuildings(user.id);

        return ApiResponse.success("Player buildings retrieved", {
            buildings: buildings
        });
    }


    /** Get player storages */
    @Get("storages")
    @Security("bearerAuth")
    public async getPlayerStorages(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const storages = await getPlayerStorages(user.id);

        return ApiResponse.success("Player storages retrieved", {
            storages: storages
        });
    }
}
