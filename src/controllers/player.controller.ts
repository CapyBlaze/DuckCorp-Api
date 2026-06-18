import type { Request as ExpressRequest } from "express";
import { Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getProductionPerMinute, getPlayerBuildings } from "../services/building.service.js";
import { getMaxStorageCapacity, getPlayerStorages } from "../services/storage.service.js";
import { checkAchievements, getPlayerAchievements } from "../services/achievement.service.js";
import { processOfflineProduction } from "../services/duck.service.js";



@Route("player")
@Tags("Player")
export class PlayerController extends Controller {
    /** Get the authenticated player's complete gameplay state after processing offline production. */
    @Get("")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Player data retrieved",
        data: {
            id: "cmz8n7r2g0000v9k4a1b2c3d4",
            ducks: 42,
            money: 900,
            productionPerMinute: 6,
            maxStorageCapacity: 10,
            buildings: [
                {
                    buildingId: "garage",
                    name: { en: "Garage", fr: "Garage" },
                    amount: 1,
                    productionPerMinute: 6
                }
            ],
            storages: [
                {
                    storageId: "cardboard_box",
                    name: { en: "Cardboard Box", fr: "Boîte en Carton" },
                    amount: 1,
                    storageCapacity: 10
                }
            ],
            achievements: [],
            achievementsUnlocked: []
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
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

        const achievementsUnlocked = await checkAchievements(user);

        
        return ApiResponse.success("Player data retrieved", {
            id: user.id,
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: user.money,
            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,

            buildings: buildings,
            storages: storages,
            achievements: achievements,

            achievementsUnlocked: achievementsUnlocked,
        });
    }


    /** Synchronize the authenticated player by applying offline duck production. */
    @Post("sync")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Player data synchronized",
        data: {
            ducks: 47.5,
            money: 900,
            productionPerMinute: 6,
            maxStorageCapacity: 10,
            achievementsUnlocked: []
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerSync(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;

        const ducksAfterSync = await processOfflineProduction(user.id);
        const productionPerMinute = await getProductionPerMinute(user.id);
        const maxStorageCapacity = await getMaxStorageCapacity(user.id);

        const achievements = await checkAchievements(user);
        
        return ApiResponse.success("Player data synchronized", {
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: user.money,
            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,
            achievementsUnlocked: achievements
        });
    }


    /** Get the authenticated player's purchased buildings and their production values. */
    @Get("buildings")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Player buildings retrieved",
        data: {
            buildings: [
                {
                    buildingId: "garage",
                    name: { en: "Garage", fr: "Garage" },
                    amount: 2,
                    productionPerMinute: 12
                }
            ]
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerBuildings(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const buildings = await getPlayerBuildings(user.id);

        return ApiResponse.success("Player buildings retrieved", {
            buildings: buildings
        });
    }


    /** Get the authenticated player's purchased storage units and capacity values. */
    @Get("storages")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Player storages retrieved",
        data: {
            storages: [
                {
                    storageId: "cardboard_box",
                    name: { en: "Cardboard Box", fr: "Boîte en Carton" },
                    amount: 3,
                    storageCapacity: 30
                }
            ]
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerStorages(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const storages = await getPlayerStorages(user.id);

        return ApiResponse.success("Player storages retrieved", {
            storages: storages
        });
    }
}
