import type { Request as ExpressRequest } from "express";
import { Body, Controller, Delete, Get, Path, Post, Request, Route, Security, SuccessResponse, Tags } from "tsoa";
import { registerUser, getUserById, deleteUserById } from "../services/auth.service.js";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";



interface RegisterBody {
    name: string;
}

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
    @Post("register")
    @SuccessResponse(201, "User registered")
    public async register(@Body() body: RegisterBody): Promise<ApiResponseFormat> {
        const { name } = body;

        if (!name) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Name is required");
        }

        const user = await registerUser(name);

        this.setStatus(201);
        return ApiResponse.success("User registered", {
            id: user.id,
            token: user.token,
            name: user.name,
            lastActive: user.lastActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }


    @Get("profile")
    @Security("bearerAuth")
    public async getProfile(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        return {
            success: true,
            message: "User data retrieved",
            data: {
                id: user.id,
                name: user.name,
                lastActive: user.lastActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            timestamp: new Date().toISOString(),
        };
    }


    @Get("player/{id}")
    public async getPlayer(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await getUserById(id);

        if (!user) {
            this.setStatus(404);
            return {
                success: false,
                error: "Player not found",
                message: "No player exists with the provided ID",
                timestamp: new Date().toISOString(),
            };
        }

        return {
            success: true,
            message: "Player data retrieved",
            data: {
                id: user.id,
                name: user.name,
                lastActive: user.lastActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            timestamp: new Date().toISOString(),
        };
    }


    @Delete("profile")
    @Security("bearerAuth")
    public async deleteProfile(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        await deleteUserById(user.id);
        return {
            success: true,
            message: "User profile deleted",
            data: { id: user.id, name: user.name },
            timestamp: new Date().toISOString(),
        };
    }
}
