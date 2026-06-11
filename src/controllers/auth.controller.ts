import type { NextFunction, Request, Response } from "express";
import { registerUser, getUserById, deleteUserById } from "../services/auth.service.js";
import { ApiResponse } from "../utils/apiResponse.js";


export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
    
        if (!name) {
            return ApiResponse.error(res, 
                "Information missing",
                "Name is required", 
                400
            );
        }
    
        const user = await registerUser(name);
    
        return ApiResponse.success(res, 
            "User registered",
            {
                id: user.id,
                token: user.token,
                name: user.name,
                lastActive: user.lastActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            201
        );

    } catch (error) {
        next(error);
    }
};


export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        return ApiResponse.success(res, 
            "User data retrieved",
            {
                id: user.id,
                name: user.name,
                lastActive: user.lastActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            200
        );

    } catch (error) {
        next(error);
    }
};


export const getPlayer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            return ApiResponse.error(res, 
                "Information missing",
                "Player ID is required",
                400
            );
        }

        const user = await getUserById(id as string);

        if (!user) {
            return ApiResponse.error(res, 
                "Player not found",
                "No player exists with the provided ID",
                404
            );
        }

        return ApiResponse.success(res, 
            "Player data retrieved",
            {
                id: user.id,
                name: user.name,
                lastActive: user.lastActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            200
        );

    } catch (error) {
        next(error);
    }
};



export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        await deleteUserById(user.id);

        return ApiResponse.success(res, 
            "User profile deleted",
            {
                id: user.id,
                name: user.name
            },
            200
        );

    } catch (error) {
        next(error);
    }
};
