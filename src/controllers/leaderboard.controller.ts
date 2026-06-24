import { Controller, Example, Get, Query, Request, Response, Route, Security, Tags } from "tsoa";

import * as LeaderboardService from "../services/leaderbord.service.js";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import type { AuthenticatedRequest } from "../types/express.js";

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
    byNbStorage = "byNbStorage",
}

@Route("leaderboard")
@Tags("Leaderboard")
export class LeaderboardController extends Controller {
    /**
     * Get a paginated leaderboard sorted by ducks, money, production, storage capacity, building count, or storage count.
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
    @Example<ApiResponseFormat>({
        success: true,
        message: "Leaderboard by ducks retrieved successfully",
        data: [
            { name: "DuckMaster", ducks: 420 },
            { name: "QuackFactory", ducks: 300 },
        ],
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getLeaderboard(
        @Query() sort?: SortType,
        @Query() page?: number,
        @Query("limit") pageSize?: number
    ): Promise<ApiResponseFormat> {
        if (!page || page < 1) page = 1;
        if (!pageSize || pageSize < 1) pageSize = 10;
        if (pageSize > 20) pageSize = 20;

        switch (sort) {
            case SortType.byDucks: {
                const players = await LeaderboardService.playersByDucks(page, pageSize);
                return ApiResponse.success("Leaderboard by ducks retrieved successfully", players);
            }

            case SortType.byMoney: {
                const players = await LeaderboardService.playersByMoney(page, pageSize);
                return ApiResponse.success("Leaderboard by money retrieved successfully", players);
            }

            case SortType.byProduction: {
                const players = await LeaderboardService.playersByProduction(page, pageSize);
                return ApiResponse.success(
                    "Leaderboard by production retrieved successfully",
                    players
                );
            }

            case SortType.byStorage: {
                const players = await LeaderboardService.playersByStorage(page, pageSize);
                return ApiResponse.success(
                    "Leaderboard by storage retrieved successfully",
                    players
                );
            }

            case SortType.byNbBuildings: {
                const players = await LeaderboardService.playersByNbBuildings(page, pageSize);
                return ApiResponse.success(
                    "Leaderboard by number of buildings retrieved successfully",
                    players
                );
            }

            case SortType.byNbStorage: {
                const players = await LeaderboardService.playersByNbStorage(page, pageSize);
                return ApiResponse.success(
                    "Leaderboard by number of storage units retrieved successfully",
                    players
                );
            }

            default: {
                const players = await LeaderboardService.playersByDucks(page, pageSize);
                return ApiResponse.success("Leaderboard by ducks retrieved successfully", players);
            }
        }
    }

    /** Get the authenticated player's rank in every leaderboard category. */
    @Get("me")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Your leaderboard ranks retrieved successfully",
        data: {
            rank: 3,
            ducksRank: 4,
            moneyRank: 6,
            productionRank: 3,
            storageRank: 5,
            nbBuildingsRank: 2,
            nbStorageRank: 7,
        },
        timestamp: "2026-06-17T18:30:00.000Z",
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getMyLeaderboard(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;

        const playerDucks = await LeaderboardService.getPlayerRank(user.id);
        return ApiResponse.success("Your leaderboard ranks retrieved successfully", playerDucks);
    }
}
