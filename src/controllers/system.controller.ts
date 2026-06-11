import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";


export const healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return ApiResponse.success(res, "System is healthy");

    } catch (error) {
        next(error);
    }
};


export const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return ApiResponse.success(res,
            "API version retrieved",
            {
                version: process.env.API_VERSION || "unknown"
            }
        );

    } catch (error) {
        next(error);
    }
};