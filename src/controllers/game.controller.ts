import { Controller, Get, Route, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";



@Route("game")
@Tags("Game")
export class GameController extends Controller {
    /** Get the game configuration */
    @Get("config")
    public async getConfig(): Promise<ApiResponseFormat> {
        return ApiResponse.success(
            "Game configuration retrieved successfully",
            {
                startingMoney: 250,
                startingDucks: 0,
                maxOfflineHours: 24,
                marketUpdateIntervalMs: 30000,
                duckPriceFluctuation: {
                    min: -5,
                    max: 25
                },
            }
        );
    }

}
