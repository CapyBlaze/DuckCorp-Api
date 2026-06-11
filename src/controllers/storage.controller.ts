import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { gameData } from "../data/GameData.js";
import { buyStorageForPlayer, BuyStorageResult } from "../services/storage.service.js";


export const getStorageList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return ApiResponse.success(res,
            "Storage list retrieved",
            gameData.storages
        );

    } catch (error) {
        next(error);
    }
};


export const buyStorage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;

        if (!id) {
            return ApiResponse.error(res, 
                "Information missing",
                "Storage ID is required", 
                400
            );
        }

        const result = await buyStorageForPlayer(req.user.id, id);

        if (!result) {
            return ApiResponse.error(res,
                "Unknown error",
                "An unknown error occurred while processing the purchase",
                500
            );
        }

        switch (result.result) {
            case BuyStorageResult.PlayerNotFound:
                return ApiResponse.failure(res,
                    "Not Found",
                    "Player not found",
                );

            case BuyStorageResult.NotEnoughMoney:
                return ApiResponse.failure(res,
                    "Not enough money",
                    "Insufficient funds to purchase this storage",
                );

            case BuyStorageResult.StorageNotFound:
                return ApiResponse.failure(res,
                    "Not Found",
                    "Storage not found",
                );

            case BuyStorageResult.Success:
                return ApiResponse.success(res,
                    "Storage purchased",
                    {
                        name: result.name,
                        playerMoney: result.playerMoney,
                        amount: result.amount,
                        storageCapacity: result.storageCapacity,
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