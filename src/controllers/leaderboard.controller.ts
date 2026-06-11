import type { Request as ExpressRequest } from "express";
import { Controller, Get, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { playersByDucks, playersByMoney, playersByNbBuildings, playersByNbStorage, playersByProduction, playersByStorage } from "../services/leaderbord.service.js";



@Route("leaderboard")
@Tags("Leaderboard")
export class LeaderboardController extends Controller {
    @Get("byDucks")
    @Security("bearerAuth")
    public async byDucks(): Promise<ApiResponseFormat> {
        const players = await playersByDucks();
        return ApiResponse.success("Leaderboard by ducks retrieved successfully", players);
    }


    @Get("byMoney")
    @Security("bearerAuth")
    public async byMoney(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const players = await playersByMoney();
        return ApiResponse.success("Leaderboard by money retrieved successfully", players);
    }


    @Get("byProduction")
    @Security("bearerAuth")
    public async byProduction(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const players = await playersByProduction();
        return ApiResponse.success("Leaderboard by production retrieved successfully", players);
    }


    @Get("byStorage")
    @Security("bearerAuth")
    public async byStorage(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const players = await playersByStorage();
        return ApiResponse.success("Leaderboard by storage retrieved successfully", players);
    }


    @Get("byNbBuildings")
    @Security("bearerAuth")
    public async byNbBuildings(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const players = await playersByNbBuildings();
        return ApiResponse.success("Leaderboard by number of buildings retrieved successfully", players);
    }


    @Get("byNbStorage")
    @Security("bearerAuth")
    public async byNbStorage(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const players = await playersByNbStorage();
        return ApiResponse.success("Leaderboard by number of storage units retrieved successfully", players);
    }
}
