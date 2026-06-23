import type { Request as ExpressRequest } from "express";
import { Controller, Example, Get, Post, Request, Response, Route, Security, Tags } from "tsoa";

import * as MarketService from "../services/market.service.js";
import * as AchievementService from "../services/achievement.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";

@Route("market")
@Tags("Market")
export class MarketController extends Controller {
    /** Get the current market price used when selling ducks. */
    @Get("price")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Current duck price retrieved",
        data: {
            price: 12.347,
        },
        timestamp: "2026-06-17T18:30:00.000Z",
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
        success: true,
        message: "Ducks sold successfully",
        data: {
            ducksSold: 42,
            duckPrice: 12.347,
            earnings: 518.574,
            achievementsUnlocked: [
                {
                    id: "first_sale",
                    name: { en: "First Sale", fr: "Première vente" },
                },
            ],
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async sellDucks(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
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
        success: true,
        message: "Price history retrieved",
        data: {
            priceHistory: [10.142, 10.856, 11.902, 12.347],
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async priceHistoryChart(): Promise<ApiResponseFormat> {
        const priceHistory = MarketService.priceHistory();
        return ApiResponse.success("Price history retrieved", { priceHistory });
    }
}
