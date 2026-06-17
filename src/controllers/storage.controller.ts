import type { Request as ExpressRequest } from "express";
import { Body, Controller, Get, Post, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameData } from "../data/GameData.js";
import { buyStorageForPlayer, BuyStorageResult } from "../services/storage.service.js";
import { checkAchievements } from "../services/achievement.service.js";



interface BuyStorageBody {
    id: string;
}

@Route("storage")
@Tags("Storage")
export class StorageController extends Controller {
    /**  Get list of available storages */
    @Get("list")
    @Security("playerAuth")
    public async getStorageList(): Promise<ApiResponseFormat> {
        return ApiResponse.success("Storage list retrieved",
            gameData.storages
        );
    }
    
    
    /** Buy a storage unit */
    @Post("buy")
    @Security("playerAuth")
    public async buyStorage(@Request() req: ExpressRequest, @Body() body: BuyStorageBody): Promise<ApiResponseFormat> {
        const { id } = body;
        const user = (req as any).user;

        if (!id) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Storage ID is required");
        }


        const result = await buyStorageForPlayer(user.id, id);
        if (!result) {
            this.setStatus(500);
            return ApiResponse.error("Unknown error", "An unknown error occurred while processing the purchase");
        }


        switch (result.result) {
            case BuyStorageResult.PlayerNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Player not found");

            case BuyStorageResult.NotEnoughMoney:
                this.setStatus(400);
                return ApiResponse.failure("Not enough money", "Insufficient funds to purchase this storage");

            case BuyStorageResult.StorageNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Storage not found");

            case BuyStorageResult.Success:
                const achievements = await checkAchievements(user);

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
