import type { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { ApiResponse } from "../utils/apiResponse.js";


export async function authHandler(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
        return ApiResponse.error(res, "Bad Request", "Missing token", 401);
    }

    const user = await prisma.player.findUnique({
        where: { token }
    });

    if (!user) {
        return ApiResponse.error(res, "Bad Request", "Invalid token", 401);
    }

    if (!user.active) {
        return ApiResponse.error(res, "Unauthorized", "User is inactive", 403);
    }

    req.user = user;
    next();
}