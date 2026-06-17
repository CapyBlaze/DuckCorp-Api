import type { Request as ExpressRequest } from "express";
import { Controller, Get, Query, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getPlayerRank, playersByDucks, playersByMoney, playersByNbBuildings, playersByNbStorage, playersByProduction, playersByStorage } from "../services/leaderbord.service.js";



/** Sort types for the leaderboard */
export enum SortType {
    /** Get the top 10 players ranked by number of ducks owned */
    byDucks = "byDucks",
    /** Get the top 10 players ranked by total money earned from selling ducks */
    byMoney = "byMoney",
    /** Get the top 10 players ranked by total duck production per minute */
    byProduction = "byProduction",
    /** Get the top 10 players ranked by total storage capacity */
    byStorage = "byStorage",
    /** Get the top 10 players ranked by total number of buildings owned */
    byNbBuildings = "byNbBuildings",
    /** Get the top 10 players ranked by total number of storage units owned */
    byNbStorage = "byNbStorage"
}


@Route("leaderboard")
@Tags("Leaderboard")
export class LeaderboardController extends Controller {
    /** 
     * Get the leaderboard sorted by the specified criteria 
     * 
     * @param sort The criteria to sort the leaderboard by (default: byDucks)
     * @param page The page number for pagination (default: 1)
     * @param pageSize The number of players to return per page (default: 10)
     * 
     * @isInt page
     * @isInt pageSize
     * @minimum page 1
     * @minimum pageSize 1
     * @maximum pageSize 20
     */
    @Get("")
    @Security("playerAuth")
    public async getLeaderboard(
        @Query() sort?: SortType,
        @Query() page?: number,
        @Query('limit') pageSize?: number
    ): Promise<ApiResponseFormat> {
        if (!page || page < 1) page = 1;
        if (!pageSize || pageSize < 1) pageSize = 10;
        if (pageSize > 20) pageSize = 20;

        switch (sort) {
            case SortType.byDucks: {
                const players = await playersByDucks(page, pageSize);
                return ApiResponse.success("Leaderboard by ducks retrieved successfully", players);
            }

            case SortType.byMoney: {
                const players = await playersByMoney(page, pageSize);
                return ApiResponse.success("Leaderboard by money retrieved successfully", players);
            }

            case SortType.byProduction: {
                const players = await playersByProduction(page, pageSize);
                return ApiResponse.success("Leaderboard by production retrieved successfully", players);
            }

            case SortType.byStorage: {
                const players = await playersByStorage(page, pageSize);
                return ApiResponse.success("Leaderboard by storage retrieved successfully", players);
            }

            case SortType.byNbBuildings: {
                const players = await playersByNbBuildings(page, pageSize);
                return ApiResponse.success("Leaderboard by number of buildings retrieved successfully", players);
            }

            case SortType.byNbStorage: {
                const players = await playersByNbStorage(page, pageSize);
                return ApiResponse.success("Leaderboard by number of storage units retrieved successfully", players);
            }

            default: {
                const players = await playersByDucks(page, pageSize);
                return ApiResponse.success("Leaderboard by ducks retrieved successfully", players);
            }
        }
    }


    /** Get the authenticated player's current rank in the leaderboard */
    @Get("me")
    @Security("playerAuth")
    public async getMyLeaderboard(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;

        const playerDucks = await getPlayerRank(user.id);
        return ApiResponse.success("Your leaderboard ranks retrieved successfully", playerDucks);
    }
}
