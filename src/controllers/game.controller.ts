import { Controller, Example, Get, Response, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameConfig } from "../config/GameConfig.js";



@Route("game")
@Tags("Game")
export class GameController extends Controller {
    /** Get the public game configuration used by clients. */
    @Get("config")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Game configuration retrieved successfully",
        data: {
            startingValues: { ducks: 0, money: 1000 },
            maxOfflineHours: 8,
            marketUpdateIntervalMs: 60000,
            duckPriceFluctuation: { min: 5, max: 20 }
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getConfig(): Promise<ApiResponseFormat> {
        return ApiResponse.success(
            "Game configuration retrieved successfully",
            gameConfig.config
        );
    }
}
