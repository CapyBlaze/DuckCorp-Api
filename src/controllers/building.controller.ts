import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { gameData } from "../data/GameData.js";
import { buyBuildingForPlayer, BuyBuildingResult } from "../services/building.service.js";


export const getBuildingList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return ApiResponse.success(res,
            "Building list retrieved",
            gameData.buildings
        );

    } catch (error) {
        next(error);
    }
};


export const buyBuilding = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;

        if (!id) {
            return ApiResponse.error(res, 
                "Information missing",
                "Building ID is required", 
                400
            );
        }

        const result = await buyBuildingForPlayer(req.user.id, id);

        if (!result) {
            return ApiResponse.error(res,
                "Unknown error",
                "An unknown error occurred while processing the purchase",
                500
            );
        }

        switch (result.result) {
            case BuyBuildingResult.PlayerNotFound:
                return ApiResponse.failure(res,
                    "Not Found",
                    "Player not found",
                );

            case BuyBuildingResult.NotEnoughMoney:
                return ApiResponse.failure(res,
                    "Not enough money",
                    "Insufficient funds to purchase this building",
                );

            case BuyBuildingResult.BuildingNotFound:
                return ApiResponse.failure(res,
                    "Not Found",
                    "Building not found",
                );

            case BuyBuildingResult.Success:
                return ApiResponse.success(res,
                    "Building purchased",
                    {
                        name: result.name,
                        playerMoney: result.playerMoney,
                        amount: result.amount,
                        productionPerMinute: result.productionPerMinute,
                        cost: result.cost
                    }
                );

            default:
                return ApiResponse.error(res,
                    "Unknown error",
                    "An unknown error occurred while processing the purchase",
                    500
                );        
        }

    } catch (error) {
        next(error);
    }
};