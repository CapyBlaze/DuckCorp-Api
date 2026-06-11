import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { getDuckPrice, getPriceHistory, sellDucksForPlayer } from "../services/market.service.js";


export const sellDucks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        const result = await sellDucksForPlayer(user.id);

        return ApiResponse.success(res, 
            "Ducks sold successfully", 
            result, 
            200
        );

    } catch (error) {
        next(error);
    }
};

export const getMarketPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const price = getDuckPrice();

        return ApiResponse.success(res, 
            "Current duck price retrieved", 
            { 
                price 
            }, 
            200
        );

    } catch (error) {
        next(error);
    }
};

export const priceHistoryChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const priceHistory = getPriceHistory();

        return ApiResponse.success(res, 
            "Price history retrieved", 
            { 
                priceHistory 
            }, 
            200
        );

    } catch (error) {
        next(error);
    }
};
