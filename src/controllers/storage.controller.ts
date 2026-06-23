import type { Request as ExpressRequest } from "express";
import { Body, Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";

import * as StorageService from "../services/storage.service.js";
import * as AchievementService from "../services/achievement.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameData } from "../data/GameData.js";



interface BuyStorageBody {
    id: string;
}

@Route("storage")
@Tags("Storage")
export class StorageController extends Controller {
    /** Get the catalog of storage units that increase the player's duck capacity. */
    @Get("")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Storage list retrieved",
        data: [
            {
                id: "cardboard_box",
                name: { en: "Cardboard Box", fr: "Boîte en Carton" },
                cost: 50,
                storageCapacity: 10
            }
        ],
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getStorageList(): Promise<ApiResponseFormat> {
        return ApiResponse.success("Storage list retrieved",
            gameData.storages
        );
    }
    
    
    /** Purchase one storage unit for the authenticated player and return the updated storage capacity. */
    @Post("buy")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Storage purchased",
        data: {
            name: { en: "Cardboard Box", fr: "Boîte en Carton" },
            playerMoney: 950,
            amount: 1,
            storageCapacity: 10,
            cost: 50,
            achievementsUnlocked: []
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(400, "Missing storage ID")
    @Response<ApiResponseFormat>(400, "Not enough money")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Storage or player not found")
    @Response<ApiResponseFormat>(500, "Purchase error")
    public async buyStorage(@Request() req: ExpressRequest, @Body() body: BuyStorageBody): Promise<ApiResponseFormat> {
        const { id } = body;
        const user = (req as any).user;

        if (!id) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Storage ID is required");
        }


        const result = await StorageService.buy(user.id, id);
        if (!result) {
            this.setStatus(500);
            return ApiResponse.error("Unknown error", "An unknown error occurred while processing the purchase");
        }


        switch (result.result) {
            case StorageService.BuyResult.PlayerNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Player not found");

            case StorageService.BuyResult.NotEnoughMoney:
                this.setStatus(400);
                return ApiResponse.failure("Not enough money", "Insufficient funds to purchase this storage");

            case StorageService.BuyResult.StorageNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Storage not found");

            case StorageService.BuyResult.Success:
                const achievements = await AchievementService.check(user);

                return ApiResponse.success("Storage purchased", {
                    name: result.name,
                    playerMoney: result.playerMoney,
                    amount: result.amount,
                    storageCapacity: result.storageCapacity,
                    cost: result.cost,
                    achievementsUnlocked: achievements
                });

            default:
                this.setStatus(500);
                return ApiResponse.error("Unknown error", "An unknown error occurred while processing the purchase");
        }
    }
}
