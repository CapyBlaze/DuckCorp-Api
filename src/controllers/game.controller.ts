import { Controller, Get, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameConfig } from "../config/GameConfig.js";



@Route("game")
@Tags("Game")
export class GameController extends Controller {
    /** Get the game configuration */
    @Get("config")
    @Security("playerAuth")
    public async getConfig(): Promise<ApiResponseFormat> {
        return ApiResponse.success(
            "Game configuration retrieved successfully",
            gameConfig.config
        );
    }
}
