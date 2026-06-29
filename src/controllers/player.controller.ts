import { Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";

import * as BuildingService from "../services/building.service.js";
import * as StorageService from "../services/storage.service.js";
import * as AchievementService from "../services/achievement.service.js";
import * as DuckService from "../services/duck.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import type { AuthenticatedRequest } from "../types/express.js";

@Route("player")
@Tags("Player")
export class PlayerController extends Controller {
    /** Get the authenticated player's complete gameplay state after processing offline production. */
    @Get("")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player data retrieved",
        "data": {
            "id": "cmqzndt500000uwkltvpoyaiq",
            "ducks": 10,
            "money": 50,
            "productionPerMinute": 6,
            "maxStorageCapacity": 10,
            "buildings": [
                {
                    "buildingId": "garage",
                    "name": {
                        "en": "Garage",
                        "fr": "Garage"
                    },
                    "amount": 1,
                    "productionPerMinute": 6
                }
            ],
            "storages": [
                {
                    "storageId": "cardboard_box",
                    "name": {
                        "en": "Cardboard Box",
                        "fr": "Boîte en Carton"
                    },
                    "amount": 1,
                    "storageCapacity": 10
                }
            ],
            "achievements": [
                {
                    "achievementId": "first_building",
                    "unlockedAt": "2026-06-29T20:08:12.544Z"
                }
            ]
        },
        "timestamp": "2026-06-29T20:08:38.020Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayer(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;

        const [ducksAfterSync, buildings, storages, achievements] = await Promise.all([
            DuckService.updateProduction(user.id),
            BuildingService.getPlayer(user.id),
            StorageService.getPlayer(user.id),
            AchievementService.playerAchievements(user.id),
        ]);

        const [productionPerMinute, maxStorageCapacity] = await Promise.all([
            BuildingService.getProductionPerMinute(user.id),
            StorageService.getMaxStorageCapacity(user.id),
        ]);

        const achievementsUnlocked = await AchievementService.check(user);

        return ApiResponse.success("Player data retrieved", {
            id: user.id,
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: Math.round(user.money * 100) / 100,
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
        "success": true,
        "message": "Player data synchronized",
        "data": {
            "ducks": 10,
            "money": 50,
            "productionPerMinute": 6,
            "maxStorageCapacity": 10
        },
        "timestamp": "2026-06-29T20:09:18.318Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerSync(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;

        const ducksAfterSync = await DuckService.updateProduction(user.id);
        const productionPerMinute = await BuildingService.getProductionPerMinute(user.id);
        const maxStorageCapacity = await StorageService.getMaxStorageCapacity(user.id);

        const achievements = await AchievementService.check(user);

        return ApiResponse.success("Player data synchronized", {
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: Math.round(user.money * 100) / 100,
            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,
            achievementsUnlocked: achievements,
        });
    }

    /** Get the authenticated player's purchased buildings and their production values. */
    @Get("buildings")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player buildings retrieved",
        "data": {
            "buildings": [
                {
                    "buildingId": "garage",
                    "name": {
                        "en": "Garage",
                        "fr": "Garage"
                    },
                    "amount": 1,
                    "productionPerMinute": 6
                }
            ]
        },
        "timestamp": "2026-06-29T20:09:48.332Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerBuildings(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;
        const buildings = await BuildingService.getPlayer(user.id);

        return ApiResponse.success("Player buildings retrieved", {
            buildings: buildings,
        });
    }

    /** Get the authenticated player's purchased storage units and capacity values. */
    @Get("storages")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player storages retrieved",
        "data": {
            "storages": [
                {
                    "storageId": "cardboard_box",
                    "name": {
                        "en": "Cardboard Box",
                        "fr": "Boîte en Carton"
                    },
                    "amount": 1,
                    "storageCapacity": 10
                }
            ]
        },
        "timestamp": "2026-06-29T20:10:13.658Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerStorages(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;
        const storages = await StorageService.getPlayer(user.id);

        return ApiResponse.success("Player storages retrieved", {
            storages: storages,
        });
    }

    /** Get the authenticated player's statistics. */
    @Get("statistics")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player statistics retrieved",
        "data": {
            "totalDucksSold": "0",
            "totalDucksProduced": "10",
            "totalMoneyGenerated": "100",
            "totalBuildings": 1,
            "totalStorage": 1,
            "lastActive": "2026-06-29T20:05:42.468Z",
            "createdAt": "2026-06-29T20:05:42.468Z"
        },
        "timestamp": "2026-06-29T20:10:32.730Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerStatistics(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;

        return ApiResponse.success("Player statistics retrieved", {
            totalDucksSold: user.totalDucksSold,
            totalDucksProduced: user.totalDucksProduced,
            totalMoneyGenerated: user.totalMoneyGenerated,
            totalBuildings: user.totalBuildings,
            totalStorage: user.totalStorage,

            lastActive: user.lastActive,
            createdAt: user.createdAt,
        });
    }
}
