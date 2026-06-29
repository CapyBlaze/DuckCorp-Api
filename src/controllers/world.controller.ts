import { Controller, Example, Get, Route, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import * as WorldService from "../services/world.service.js";

@Route("world")
@Tags("World")
export class WorldController extends Controller {
    /** Get world statistics */
    @Get("")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "World statistics retrieved",
        "data": {
            "players": 10,
            "ducksProduced": "18412",
            "ducksSold": "18102",
            "moneyGenerated": "178012"
        },
        "timestamp": "2026-06-29T20:25:24.105Z"
    })
    public async worldStats(): Promise<ApiResponseFormat> {
        const playerCount = await WorldService.countPlayers();
        const worldState = await WorldService.getState();

        return ApiResponse.success("World statistics retrieved", {
            players: playerCount,
            ducksProduced: worldState?.totalDucksProduced ?? "unknown",
            ducksSold: worldState?.totalDucksSold ?? "unknown",
            moneyGenerated: worldState?.totalMoneyGenerated ?? "unknown",
        });
    }
}
