import {
    Body,
    Controller,
    Delete,
    Example,
    Get,
    Path,
    Post,
    Request,
    Response,
    Route,
    Security,
    SuccessResponse,
    Tags,
} from "tsoa";

import * as AuthService from "../services/auth.service.js";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import type { AuthenticatedRequest } from "../types/express.js";

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
        "success": true,
        "message": "User registered",
        "data": {
            "id": "cmqzn8tdw000098kl3upzydbt",
            "token": "fa83285e-641b-44cc-971f-92a49781dcc7",
            "name": "DuckMaster",
            "lastActive": "2026-06-29T20:01:49.508Z",
            "createdAt": "2026-06-29T20:01:49.508Z",
            "updatedAt": "2026-06-29T20:01:49.508Z"
        },
        "timestamp": "2026-06-29T20:01:49.519Z"
    })
    @Response<ApiResponseFormat>(400, "Missing name")
    @SuccessResponse(201, "User registered")
    public async register(@Body() body: RegisterBody): Promise<ApiResponseFormat> {
        const { name } = body;

        if (!name) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Name is required");
        }

        const user = await AuthService.registerUser(name);

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
        "success": true,
        "message": "User data retrieved",
        "data": {
            "id": "cmqzn8tdw000098kl3upzydbt",
            "name": "DuckMaster",
            "lastActive": "2026-06-29T20:01:49.508Z",
            "createdAt": "2026-06-29T20:01:49.508Z",
            "updatedAt": "2026-06-29T20:01:49.508Z"
        },
        "timestamp": "2026-06-29T20:03:01.989Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getProfile(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;

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
        "success": true,
        "message": "Player data retrieved",
        "data": {
            "id": "cmqzn8tdw000098kl3upzydbt",
            "name": "DuckMasterWarrior",
            "lastActive": "2026-06-29T20:01:49.508Z",
            "createdAt": "2026-06-29T20:01:49.508Z",
            "updatedAt": "2026-06-29T20:01:49.508Z"
        },
        "timestamp": "2026-06-29T20:03:39.807Z"
    })
    @Response<ApiResponseFormat>(404, "Player not found")
    public async getPlayer(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await AuthService.getUser(id);

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
        "success": true,
        "message": "User profile deleted",
        "data": {
            "id": "cmqzn8tdw000098kl3upzydbt",
            "name": "DuckMasterMaster",
        },
        "timestamp": "2026-06-29T20:04:50.271Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async deleteProfile(@Request() req: AuthenticatedRequest): Promise<ApiResponseFormat> {
        const user = req.user;
        await AuthService.disableUser(user.id);

        return ApiResponse.success("User profile deleted", {
            id: user.id,
            name: user.name,
        });
    }
}
