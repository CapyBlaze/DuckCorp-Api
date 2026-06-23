import { 
    Controller, 
    Example, 
    Get, 
    Response, 
    Route, 
    Security, 
    Tags 
} from "tsoa";

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
        success: true,
        message: "Achievements retrieved",
        data: {
            achievements: [
                {
                    id: "first_duck",
                    name: { en: "First Duck", fr: "Premier Canard" },
                    description: { en: "Produce your first duck.", fr: "Produisez votre premier canard." },
                    condition: { type: "ducks", value: 1 }
                }
            ]
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getAchievements(): Promise<ApiResponseFormat> {
        const achievements = await AchievementService.achievements();
        return ApiResponse.success("Achievements retrieved", { achievements });
    }
}
