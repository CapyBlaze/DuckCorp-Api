import type { Request as ExpressRequest } from "express";
import { Body, Controller, Get, Post, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameData } from "../data/GameData.js";
import { buyBuildingForPlayer, BuyBuildingResult } from "../services/building.service.js";



interface BuyBuildingBody {
    id: string;
}

@Route("building")
@Tags("Building")
export class BuildingController extends Controller {
    /** Get the list of available buildings that can be purchased */
    @Get("list")
    @Security("bearerAuth")
    public async getBuildingList(): Promise<ApiResponseFormat> {
        return ApiResponse.success("Building list retrieved", gameData.buildings);
    }


    /** Purchase a building for the authenticated player */
    @Post("buy")
    @Security("bearerAuth")
    public async buyBuilding(@Request() req: ExpressRequest, @Body() body: BuyBuildingBody): Promise<ApiResponseFormat> {
        const { id } = body;
        const user = (req as any).user;

        if (!id) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Building ID is required");
        }


        const result = await buyBuildingForPlayer(user.id, id);
        if (!result) {
            this.setStatus(500);
            return ApiResponse.error("Unknown error", "An unknown error occurred while processing the purchase");
        }


        switch (result.result) {
            case BuyBuildingResult.PlayerNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Player not found");

            case BuyBuildingResult.NotEnoughMoney:
                this.setStatus(400);
                return ApiResponse.failure("Not enough money", "Insufficient funds to purchase this building");

            case BuyBuildingResult.BuildingNotFound:
                this.setStatus(404);
                return ApiResponse.failure("Not Found", "Building not found");

            case BuyBuildingResult.Success:
                return ApiResponse.success("Building purchased", {
                    name: result.name,
                    playerMoney: result.playerMoney,
                    amount: result.amount,
                    productionPerMinute: result.productionPerMinute,
                    cost: result.cost
                });

            default:
                this.setStatus(500);
                return ApiResponse.error("Unknown error", "An unknown error occurred while processing the purchase");
        }
    }
}
