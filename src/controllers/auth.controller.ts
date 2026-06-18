import type { Request as ExpressRequest } from "express";
import { Body, Controller, Delete, Example, Get, Path, Post, Request, Response, Route, Security, SuccessResponse, Tags } from "tsoa";
import { registerUser, getUserById, deleteUserById } from "../services/auth.service.js";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";



interface RegisterBody {
    name: string;
}

@Route("auth")
@Tags("Auth")
export class AuthController extends Controller {
    /**
     * Register a new player account.
     * The response includes the bearer token used to authenticate player routes.
     */
    @Post("register")
    @Example<ApiResponseFormat>({
        success: true,
        message: "User registered",
        data: {
            id: "cmz8n7r2g0000v9k4a1b2c3d4",
            token: "ba546530-96b6-4233-8552-7e1f4ce6c9d2",
            name: "DuckMaster",
            lastActive: "2026-06-17T18:30:00.000Z",
            createdAt: "2026-06-17T18:30:00.000Z",
            updatedAt: "2026-06-17T18:30:00.000Z"
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(400, "Missing name")
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


    /** Get the profile of the authenticated player from the bearer token. */
    @Get("profile")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "User data retrieved",
        data: {
            id: "cmz8n7r2g0000v9k4a1b2c3d4",
            name: "DuckMaster",
            lastActive: "2026-06-17T18:30:00.000Z",
            createdAt: "2026-06-17T18:25:00.000Z",
            updatedAt: "2026-06-17T18:30:00.000Z"
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
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


    /** Get a public player profile by ID. This route does not expose money, ducks, token, or private progress data. */
    @Get("player/{id}")
    @Example<ApiResponseFormat>({
        success: true,
        message: "Player data retrieved",
        data: {
            id: "cmz8n7r2g0000v9k4a1b2c3d4",
            name: "DuckMaster",
            lastActive: "2026-06-17T18:30:00.000Z",
            createdAt: "2026-06-17T18:25:00.000Z",
            updatedAt: "2026-06-17T18:30:00.000Z"
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(404, "Player not found")
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


    /** Delete the authenticated player's account and progress. */
    @Delete("profile")
    @Security("playerAuth")
    @Example<ApiResponseFormat>({
        success: true,
        message: "User profile deleted",
        data: {
            id: "cmz8n7r2g0000v9k4a1b2c3d4",
            name: "DuckMaster"
        },
        timestamp: "2026-06-17T18:30:00.000Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async deleteProfile(@Request() req: ExpressRequest): Promise<ApiResponseFormat> {
        const user = (req as any).user;
        await deleteUserById(user.id);

        return ApiResponse.success("User profile deleted", { 
            id: user.id, 
            name: user.name 
        });
    }
}
