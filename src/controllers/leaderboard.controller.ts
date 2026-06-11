import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";
import { playersByDucks, playersByMoney, playersByNbBuildings, playersByNbStorage, playersByProduction, playersByStorage } from "../services/leaderbord.service.js";


export const byDucks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await playersByDucks();

        ApiResponse.success(res, 
            "Leaderboard by ducks retrieved successfully",
            players
        );

    } catch (error) {
        next(error);
    }
};

export const byMoney = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await playersByMoney();

        ApiResponse.success(res, 
            "Leaderboard by money retrieved successfully",
            players
        );

    } catch (error) {
        next(error);
    }
};

export const byProduction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await playersByProduction();

        ApiResponse.success(res, 
            "Leaderboard by production retrieved successfully",
            players
        );

    } catch (error) {
        next(error);
    }
};

export const byStorage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await playersByStorage();

        ApiResponse.success(res, 
            "Leaderboard by storage retrieved successfully",
            players
        );

    } catch (error) {
        next(error);
    }
};

export const byNbBuildings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await playersByNbBuildings();

        ApiResponse.success(res, 
            "Leaderboard by number of buildings retrieved successfully",
            players
        );

    } catch (error) {
        next(error);
    }
};

export const byNbStorage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const players = await playersByNbStorage();

        ApiResponse.success(res, 
            "Leaderboard by number of storage units retrieved successfully",
            players
        );

    } catch (error) {
        next(error);
    }
};
