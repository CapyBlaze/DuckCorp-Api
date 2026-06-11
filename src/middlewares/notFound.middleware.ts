import type { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/apiResponse.js";


export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    return ApiResponse.error(
        res,
        "Not Found",
        `Route ${req.method} ${req.originalUrl} does not exist.`,
        404
    );
};
