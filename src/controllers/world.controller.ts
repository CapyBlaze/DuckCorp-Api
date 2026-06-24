import { Controller, Example, Get, Route, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import * as WorldService from "../services/world.service.js";

@Route("world")
@Tags("World")
export class WorldController extends Controller {
    /** Get world statistics */
    @Get("")
    @Example<ApiResponseFormat>({
        success: true,
        message: "World statistics retrieved",
        data: {
            players: 12,
            ducksProduced: 12000,
            ducksSold: 8450,
            moneyGenerated: 103250,
        },
        timestamp: "2026-06-17T18:30:00.000Z",
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
