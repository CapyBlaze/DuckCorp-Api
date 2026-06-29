import { Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";

import * as MarketService from "../services/market.service.js";
import * as AchievementService from "../services/achievement.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import type { AuthenticatedRequest } from "../types/express.js";

@Route("market")
@Tags("Market")
export class MarketController extends Controller {
    /** Get the current market price used when selling ducks. */
    @Get("price")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Current duck price retrieved",
        "data": {
            "price": 4.549
        },
        "timestamp": "2026-06-29T20:14:05.240Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getMarketPrice(): Promise<ApiResponseFormat> {
        const price = MarketService.duckPrice();
        return ApiResponse.success("Current duck price retrieved", { price });
    }

    /** Sell all ducks owned by the authenticated player at the current market price. */
    @Post("sell")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Ducks sold successfully",
        "data": {
            "ducksSold": 10,
            "duckPrice": 11.252,
            "earnings": 112.52000000000001
        },
        "timestamp": "2026-06-29T20:14:37.881Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async sellDucks(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;
        const result = await MarketService.sell(user.id);

        const achievements = await AchievementService.check(user);

        return ApiResponse.success("Ducks sold successfully", {
            ...result,
            achievementsUnlocked: achievements,
        });
    }

    /** Get the last 100 computed market prices for charts and trend displays. */
    @Get("history")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Price history retrieved",
        "data": {
            "priceHistory": [
                 3.311, 10.708, 10.839, 17.557, 13.703, 15.15 ,  7.12 ,  7.499,  2.013,  7.3  , 
                 6.876, 14.854, 13.677, 17.57 , 11.188, 10.866,  3.625,  5.775,  3.65 , 10.633, 
                11.347, 17.238, 14.086, 14.47 ,  7.484,  6.749,  2.685,  6.702,  7.854, 14.199, 
                14.625, 16.573, 11.986,  9.649,  4.557,  4.676,  4.922,  9.655, 12.733, 16.058, 
                15.29 , 12.988,  8.618,  5.268,  4.067,  5.44 ,  9.467, 12.943, 16.127, 15.048, 
                13.263,  7.992,  5.897,  3.223,  6.517,  8.402, 14.348, 14.683, 16.632, 11.402, 
                 9.809,  3.781,  5.424,  4.26 , 10.959, 11.848, 17.414, 13.77 , 14.242,  6.674, 
                 6.861,  2.198,  7.655,  7.651, 15.418, 13.88 , 17.352, 10.465, 10.316,  3.018, 
                 6.035,  3.867, 11.64 , 11.591, 17.826, 13.378, 14.302,  6.296,  6.872,  2.158, 
                 7.803,  7.912, 15.46 , 14.106, 17.021, 10.579,  9.763,  3.327,  5.585,  4.549
            ]
        },
        "timestamp": "2026-06-29T20:14:57.485Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async priceHistoryChart(): Promise<ApiResponseFormat> {
        const priceHistory = MarketService.priceHistory();
        return ApiResponse.success("Price history retrieved", { priceHistory });
    }
}
