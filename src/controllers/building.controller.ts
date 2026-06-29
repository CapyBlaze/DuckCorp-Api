import {
    Body,
    Controller,
    Example,
    Get,
    Post,
    Request,
    Response,
    Route,
    Security,
    Tags,
} from "tsoa";

import * as BuildingService from "../services/building.service.js";
import * as AchievementService from "../services/achievement.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameData } from "../data/GameData.js";
import type { AuthenticatedRequest } from "../types/express.js";

interface BuyBuildingBody {
    id: string;
}

@Route("building")
@Tags("Building")
export class BuildingController extends Controller {
    /** Get the catalog of buildings that players can purchase to increase duck production. */
    @Get("")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Building list retrieved",
        "data": [
            {
                "id": "garage",
                "name": {
                    "en": "Garage",
                    "fr": "Garage"
                },
                "cost": 100,
                "production": 0.1
            }
        ],
        "timestamp": "2026-06-29T20:06:07.428Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getBuildingList(): Promise<ApiResponseFormat> {
        return ApiResponse.success("Building list retrieved", gameData.buildings);
    }

    /** Purchase one building for the authenticated player and return the updated building amount and production. */
    @Post("buy")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Building purchased",
        "data": {
            "name": {
                "en": "Garage",
                "fr": "Garage"
            },
            "playerMoney": 50,
            "amount": 1,
            "productionPerMinute": 6,
            "cost": 100
        },
        "timestamp": "2026-06-29T20:06:43.023Z"
    })
    @Response<ApiResponseFormat>(400, "Missing building ID")
    @Response<ApiResponseFormat>(400, "Not enough money")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Building or player not found")
    @Response<ApiResponseFormat>(500, "Purchase error")
    public async buyBuilding(@Request() req: AuthenticatedRequest, @Body() body: BuyBuildingBody): Promise<ApiResponseFormat> {
        const { id } = body;
        const user = req.user;

        if (!id) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Building ID is required");
        }

        const result = await BuildingService.buy(user.id, id);
        if (!result) {
            this.setStatus(500);
            return ApiResponse.error(
                "Unknown error",
                "An unknown error occurred while processing the purchase"
            );
        }

        switch (result.result) {
            case BuildingService.BuyResult.PlayerNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Player not found");

            case BuildingService.BuyResult.NotEnoughMoney:
                this.setStatus(400);
                return ApiResponse.failure(
                    "Not enough money",
                    "Insufficient funds to purchase this building"
                );

            case BuildingService.BuyResult.BuildingNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Building not found");

            case BuildingService.BuyResult.Success:
                const achievements = await AchievementService.check(user);

                return ApiResponse.success("Building purchased", {
                    name: result.name,
                    playerMoney: result.playerMoney,
                    amount: result.amount,
                    productionPerMinute: result.productionPerMinute,
                    cost: result.cost,
                    achievementsUnlocked: achievements,
                });

            default:
                this.setStatus(500);
                return ApiResponse.error(
                    "Unknown error",
                    "An unknown error occurred while processing the purchase"
                );
        }
    }
}
