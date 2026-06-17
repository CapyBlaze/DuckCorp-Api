import type { Request as ExpressRequest } from "express";
import { Controller, Get, Post, Request, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getAllAchievements } from "../services/achievement.service.js";



@Route("achievement")
@Tags("Achievement")
export class AchievementController extends Controller {
    /** */
    @Get("list")
    @Security("playerAuth")
    public async getAchievements(): Promise<ApiResponseFormat> {
        const achievements = await getAllAchievements();
        return ApiResponse.success("Achievements retrieved", { achievements });
    }
}
