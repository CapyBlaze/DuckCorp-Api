import type { Request as ExpressRequest } from "express";
import { Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";

import * as BuildingService from "../services/building.service.js";
import * as StorageService from "../services/storage.service.js";
import * as AchievementService from "../services/achievement.service.js";
import * as DuckService from "../services/duck.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";

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
                    productionPerMinute: 6,
                },
            ],
            storages: [
                {
                    storageId: "cardboard_box",
                    name: { en: "Cardboard Box", fr: "Boîte en Carton" },
                    amount: 1,
                    storageCapacity: 10,
                },
            ],
            achievements: [],
            achievementsUnlocked: [],
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayer(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;

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
            achievementsUnlocked: [],
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerSync(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;

        const ducksAfterSync = await DuckService.updateProduction(user.id);
        const productionPerMinute = await BuildingService.getProductionPerMinute(user.id);
        const maxStorageCapacity = await StorageService.getMaxStorageCapacity(user.id);

        const achievements = await AchievementService.check(user);

        return ApiResponse.success("Player data synchronized", {
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: user.money,
            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,
            achievementsUnlocked: achievements,
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
                    productionPerMinute: 12,
                },
            ],
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerBuildings(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const buildings = await BuildingService.getPlayer(user.id);

        return ApiResponse.success("Player buildings retrieved", {
            buildings: buildings,
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
                    storageCapacity: 30,
                },
            ],
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerStorages(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const storages = await StorageService.getPlayer(user.id);

        return ApiResponse.success("Player storages retrieved", {
            storages: storages,
        });
    }

    /** Get the authenticated player's statistics. */
    @Get("statistics")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Player statistics retrieved",
        data: {
            totalDucksSold: 100,
            totalDucksProduced: 500,
            totalMoneyGenerated: 1000,
            totalBuildings: 5,
            totalStorage: 3,
            lastActive: "2026-06-24T09:23:44.898Z",
            createdAt: "2026-06-17T18:30:00.000Z",
        },
        timestamp: "2026-06-25T17:00:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayerStatistics(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;

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
