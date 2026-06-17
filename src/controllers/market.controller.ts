import type { Request as ExpressRequest } from "express";
import { Controller, Get, Post, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getDuckPrice, getPriceHistory, sellDucksForPlayer } from "../services/market.service.js";
import { checkAchievements } from "../services/achievement.service.js";



@Route("market")
@Tags("Market")
export class MarketController extends Controller {
    /** Get the current price of ducks in the market */
    @Get("price")
    @Security("playerAuth")
    public async getMarketPrice(): Promise<ApiResponseFormat> {
        const price = getDuckPrice();
        return ApiResponse.success("Current duck price retrieved", { price });
    }
    

    /** Sell all ducks for the authenticated player and return the total amount earned */
    @Post("sell")
    @Security("playerAuth")
    public async sellDucks(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const result = await sellDucksForPlayer(user.id);

        const achievements = await checkAchievements(user);
        
        return ApiResponse.success("Ducks sold successfully", { 
            ...result, 
            achievementsUnlocked: achievements 
        });
    }
    

    /** Get the history of the last 100 duck prices on the market */
    @Get("history")
    @Security("playerAuth")
    public async priceHistoryChart(): Promise<ApiResponseFormat> {
        const priceHistory = getPriceHistory();
        return ApiResponse.success("Price history retrieved", { priceHistory });
    }
}
