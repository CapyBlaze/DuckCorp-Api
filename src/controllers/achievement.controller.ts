import { Controller, Example, Get, Response, Route, Security, Tags } from "tsoa";

import * as AchievementService from "../services/achievement.service.js";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";

@Route("achievement")
@Tags("Achievement")
export class AchievementController extends Controller {
    /**
     * Get every achievement available in the game.
     * Use this route to display the achievement catalog, including locked
     * achievements that the authenticated player has not unlocked yet.
     */
    @Get("")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Achievements retrieved",
        "data": {
            "achievements": [
                {
                    "id": "first_duck",
                    "category": "production",
                    "hidden": false,
                    "name": {
                        "en": "First Duck",
                        "fr": "Premier Coin-Coin"
                    },
                    "description": {
                        "en": "Produce 1 duck",
                        "fr": "Produire 1 canard"
                    },
                    "condition": {
                        "type": "total_ducks_produced",
                        "value": 1
                    },
                    "reward": {
                        "money": 50
                    }
                }
            ]
        },
        "timestamp": "2026-06-29T20:21:30.602Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getAchievements(): Promise<ApiResponseFormat> {
        const achievements = await AchievementService.achievements();
        return ApiResponse.success("Achievements retrieved", { achievements });
    }
}
