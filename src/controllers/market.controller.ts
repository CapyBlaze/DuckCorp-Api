import type { Request as ExpressRequest } from "express";
import { Controller, Get, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getDuckPrice, getPriceHistory, sellDucksForPlayer } from "../services/market.service.js";



@Route("market")
@Tags("Market")
export class MarketController extends Controller {
    @Get("")
    @Security("bearerAuth")
    public async sellDucks(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        const result = await sellDucksForPlayer(user.id);

        return ApiResponse.success("Ducks sold successfully", result);
    }


    @Get("sell")
    @Security("bearerAuth")
    public async getMarketPrice(): Promise<ApiResponseFormat> {
        const price = getDuckPrice();
        return ApiResponse.success("Current duck price retrieved", { price });
    }


    @Get("history")
    @Security("bearerAuth")
    public async priceHistoryChart(): Promise<ApiResponseFormat> {
        const priceHistory = getPriceHistory();
        return ApiResponse.success("Price history retrieved", { priceHistory });
    }
}
