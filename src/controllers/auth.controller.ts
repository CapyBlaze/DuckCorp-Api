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
    /** Register a new user */
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


    /** Get the profile of the authenticated user */
    @Get("profile")
    @Security("playerAuth")
    public async getProfile(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        return ApiResponse.success("User data retrieved", {
            id: user.id,
            name: user.name,
            lastActive: user.lastActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }


    /** Get a player's profile by ID (public endpoint) */
    @Get("player/{id}")
    public async getPlayer(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await getUserById(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player data retrieved", {
            id: user.id,
            name: user.name,
            lastActive: user.lastActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    }


    /** Delete the profile of the authenticated user */
    @Delete("profile")
    @Security("playerAuth")
    public async deleteProfile(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        await deleteUserById(user.id);

        return ApiResponse.success("User profile deleted", { 
            id: user.id, 
            name: user.name 
        });
    }
}
