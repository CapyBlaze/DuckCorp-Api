import {
    Body,
    Controller,
    Delete,
    Example,
    Get,
    Path,
    Post,
    Put,
    Query,
    Response,
    Route,
    Security,
    Tags,
} from "tsoa";

import systeminformation from "systeminformation";
import os from "os";

import * as WorldService from "../services/world.service.js";
import * as BuildingService from "../services/building.service.js";
import * as StorageService from "../services/storage.service.js";
import * as AchievementService from "../services/achievement.service.js";
import * as AdminService from "../services/admin.service.js";
import * as DuckService from "../services/duck.service.js";

import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { gameConfig } from "../config/GameConfig.js";

interface RegisterAdminBody {
    username: string;
    password: string;
}

interface ConfigUpdateBody {
    startingValues?: {
        ducks: number;
        money: number;
    };
    maxOfflineHours?: number;
    marketUpdateIntervalMs?: number;
    duckPriceFluctuation?: {
        min: number;
        max: number;
    };
}

interface SetPlayerMoneyBody {
    money: number;
}

interface SetPlayerDucksBody {
    ducks: number;
}

interface AddPlayerMoneyBody {
    money: number;
}

interface AddPlayerDucksBody {
    ducks: number;
}

interface RemovePlayerMoneyBody {
    money: number;
}

interface RemovePlayerDucksBody {
    ducks: number;
}

interface IPBanBody {
    ipAddress: string;
}

@Route("admin")
@Tags("Admin")
export class AdminController extends Controller {
    /** Authenticate as an administrator and receive the bearer token required for admin routes. */
    @Post("login")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "User logged in",
        "data": {
            "token": "928c178f-7ce3-463e-a6b3-1bdba6b5c931",
            "name": "admin"
        },
        "timestamp": "2026-06-29T21:21:40.446Z"
    })
    @Response<ApiResponseFormat>(400, "Missing credentials")
    public async login(@Body() body: RegisterAdminBody): Promise<ApiResponseFormat> {
        const { username, password } = body;

        if (!username || !password) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Username and password are required");
        }

        const token = await AdminService.login(username, password);

        this.setStatus(201);
        return ApiResponse.success("User logged in", {
            token: token,
            name: username,
        });
    }

    /** Get the current game configuration, including starting values and market tuning. */
    @Get("config")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Game configuration retrieved successfully",
        "data": {
            "startingValues": {
                "money": 150,
                "ducks": 0
            },
            "maxOfflineHours": 24,
            "marketUpdateIntervalMs": 30000,
            "duckPriceFluctuation": {
                "min": -5,
                "max": 25
            }
        },
        "timestamp": "2026-06-29T21:22:06.338Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getConfig(): Promise<ApiResponseFormat> {
        return ApiResponse.success("Game configuration retrieved successfully", gameConfig.config);
    }

    /** Update one or more game configuration values and persist them to disk. */
    @Put("config")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Game configuration updated successfully",
        "data": {
            "startingValues": {
                "money": 1000,
                "ducks": 0
            },
            "maxOfflineHours": 8,
            "marketUpdateIntervalMs": 60000,
            "duckPriceFluctuation": {
                "min": 5,
                "max": 20
            }
        },
        "timestamp": "2026-06-29T21:22:51.262Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid configuration value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async updateConfig(@Body() body: ConfigUpdateBody): Promise<ApiResponseFormat> {
        const { startingValues, maxOfflineHours, marketUpdateIntervalMs, duckPriceFluctuation } =
            body;

        if (startingValues !== undefined) {
            if (startingValues?.ducks !== undefined && startingValues.ducks < 0) {
                this.setStatus(400);
                return ApiResponse.error(
                    "Invalid value",
                    "startingValues.ducks must be a non-negative number"
                );
            }

            if (startingValues?.money !== undefined && startingValues.money < 0) {
                this.setStatus(400);
                return ApiResponse.error(
                    "Invalid value",
                    "startingValues.money must be a non-negative number"
                );
            }

            gameConfig.config.startingValues = {
                ...gameConfig.config.startingValues,
                ...startingValues,
            };
        }

        if (maxOfflineHours !== undefined) {
            if (maxOfflineHours < 0) {
                this.setStatus(400);
                return ApiResponse.error(
                    "Invalid value",
                    "maxOfflineHours must be a non-negative number"
                );
            }

            gameConfig.config.maxOfflineHours = maxOfflineHours;
        }

        if (marketUpdateIntervalMs !== undefined) {
            gameConfig.config.marketUpdateIntervalMs = marketUpdateIntervalMs;
        }

        if (duckPriceFluctuation !== undefined) {
            if (
                duckPriceFluctuation.min > duckPriceFluctuation.max ||
                duckPriceFluctuation.min < 0
            ) {
                this.setStatus(400);
                return ApiResponse.error(
                    "Invalid value",
                    "duckPriceFluctuation min must be less than or equal to max and both must be non-negative"
                );
            }

            gameConfig.config.duckPriceFluctuation = {
                ...gameConfig.config.duckPriceFluctuation,
                ...duckPriceFluctuation,
            };
        }

        await gameConfig.save();

        return ApiResponse.success("Game configuration updated successfully", gameConfig.config);
    }

    /**
     * Get a paginated list of players
     *
     * @param page The page number for pagination (default: 1)
     * @param pageSize The number of players to return per page (default: 10)
     *
     * @isInt page
     * @isInt pageSize
     * @minimum page 1
     * @minimum pageSize 1
     * @maximum pageSize 500
     */
    @Get("players")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player data retrieved",
        "data": [
            {
                "id": "cmqzndt500000uwkltvpoyaiq",
                "name": "Eugenia69",
                "ducks": 10,
                "money": 212.52,
                "productionPerMinute": 6,
                "maxStorageCapacity": 10,
                "active": true,
                "lastSync": "2026-06-29T20:14:37.838Z",
                "lastActive": "2026-06-29T20:05:42.468Z",
                "createdAt": "2026-06-29T20:05:42.468Z",
                "updatedAt": "2026-06-29T20:14:37.858Z",
                "buildings": [
                    {
                        "buildingId": "garage",
                        "name": {
                            "en": "Garage",
                            "fr": "Garage"
                        },
                        "amount": 1,
                        "productionPerMinute": 6
                    }
                ],
                "storages": [
                    {
                        "storageId": "cardboard_box",
                        "name": {
                            "en": "Cardboard Box",
                            "fr": "Boîte en Carton"
                        },
                        "amount": 1,
                        "storageCapacity": 10
                    }
                ],
                "achievements": [
                    {
                        "achievementId": "first_building",
                        "unlockedAt": "2026-06-29T20:08:12.544Z"
                    }
                ]
            }
        ],
        "timestamp": "2026-06-29T21:22:17.860Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getPlayers(
        @Query() page?: number,
        @Query("limit") pageSize?: number
    ): Promise<ApiResponseFormat> {
        if (!page || page < 1) page = 1;
        if (!pageSize || pageSize < 1) pageSize = 10;
        if (pageSize > 500) pageSize = 500;

        const players = await AdminService.players(page, pageSize);

        let data = [];
        for (const player of players) {
            const [ducksAfterSync, buildings, storages, achievements] = await Promise.all([
                DuckService.updateProduction(player.id),
                BuildingService.getPlayer(player.id),
                StorageService.getPlayer(player.id),
                AchievementService.playerAchievements(player.id),
            ]);

            const [productionPerMinute, maxStorageCapacity] = await Promise.all([
                BuildingService.getProductionPerMinute(player.id),
                StorageService.getMaxStorageCapacity(player.id),
            ]);

            data.push({
                id: player.id,
                name: player.name,
                ducks: ducksAfterSync === -1 ? player.ducks : ducksAfterSync,
                money: player.money,

                productionPerMinute: productionPerMinute,
                maxStorageCapacity: maxStorageCapacity,

                active: player.active,
                lastSync: player.lastSync,
                lastActive: player.lastActive,
                createdAt: player.createdAt,
                updatedAt: player.updatedAt,

                buildings: buildings,
                storages: storages,
                achievements: achievements,
            });
        }

        return ApiResponse.success("Player data retrieved", data);
    }

    /** Get complete gameplay and account details for one player by ID. */
    @Get("players/{id}")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player data retrieved",
        "data": {
            "id": "cmqzndt500000uwkltvpoyaiq",
            "name": "Eugenia69",
            "ducks": 10,
            "money": 212.52,
            "productionPerMinute": 6,
            "maxStorageCapacity": 10,
            "active": true,
            "lastSync": "2026-06-29T21:22:17.844Z",
            "lastActive": "2026-06-29T20:05:42.468Z",
            "createdAt": "2026-06-29T20:05:42.468Z",
            "updatedAt": "2026-06-29T21:22:17.844Z",
            "buildings": [
                {
                    "buildingId": "garage",
                    "name": {
                        "en": "Garage",
                        "fr": "Garage"
                    },
                    "amount": 1,
                    "productionPerMinute": 6
                }
            ],
            "storages": [
                {
                    "storageId": "cardboard_box",
                    "name": {
                        "en": "Cardboard Box",
                        "fr": "Boîte en Carton"
                    },
                    "amount": 1,
                    "storageCapacity": 10
                }
            ],
            "achievements": [
                {
                    "achievementId": "first_building",
                    "unlockedAt": "2026-06-29T20:08:12.544Z"
                },
                {
                    "achievementId": "first_duck",
                    "unlockedAt": "2026-06-29T20:09:18.307Z"
                }
            ]
        },
        "timestamp": "2026-06-29T21:22:29.706Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async getPlayerById(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await AdminService.getPlayer(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        const [ducksAfterSync, buildings, storages, achievements] = await Promise.all([
            DuckService.updateProduction(user.id),
            BuildingService.getPlayer(user.id),
            StorageService.getPlayer(user.id),
            AchievementService.playerAchievements(user.id),
        ]);

        const [productionPerMinute, maxStorageCapacity] = await Promise.all([
            BuildingService.getProductionPerMinute(user.id),
            StorageService.getMaxStorageCapacity(user.id),
        ]);

        return ApiResponse.success("Player data retrieved", {
            id: user.id,
            name: user.name,
            ducks: ducksAfterSync === -1 ? user.ducks : ducksAfterSync,
            money: user.money,

            productionPerMinute: productionPerMinute,
            maxStorageCapacity: maxStorageCapacity,

            active: user.active,
            lastSync: user.lastSync,
            lastActive: user.lastActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

            buildings: buildings,
            storages: storages,
            achievements: achievements,
        });
    }

    /** Delete a player account and return the deleted player's identity. */
    @Delete("players/{id}")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player deleted",
        "data": {
            "id": "cmqzndt500000uwkltvpoyaiq",
            "name": "Eugenia69"
        },
        "timestamp": "2026-06-29T21:23:10.045Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async deletePlayer(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await AdminService.deletePlayer(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player deleted", {
            id: user.id,
            name: user.name,
        });
    }

    /** Reset a player's progress to default game values while keeping the account. */
    @Post("players/{id}/reset")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player reset",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24"
        },
        "timestamp": "2026-06-29T21:28:23.724Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async resetPlayer(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await AdminService.resetPlayer(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player reset", {
            id: user.id,
            name: user.name,
        });
    }

    /** Replace a player's money amount with an exact non-negative value. */
    @Post("players/{id}/money")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player money updated",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24",
            "money": 5000
        },
        "timestamp": "2026-06-29T21:28:56.795Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid money value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async setPlayerMoney(
        @Path() id: string,
        @Body() body: SetPlayerMoneyBody
    ): Promise<ApiResponseFormat> {
        const { money } = body;

        if (money === undefined || money < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Money must be a non-negative number");
        }

        const user = await AdminService.setPlayerMoney(id, money);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player money updated", {
            id: user.id,
            name: user.name,
            money: user.money,
        });
    }

    /** Replace a player's duck amount with an exact non-negative value. */
    @Post("players/{id}/ducks")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player ducks updated",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24",
            "ducks": 250
        },
        "timestamp": "2026-06-29T21:29:07.453Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid duck value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async setPlayerDucks(
        @Path() id: string,
        @Body() body: SetPlayerDucksBody
    ): Promise<ApiResponseFormat> {
        const { ducks } = body;

        if (ducks === undefined || ducks < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Ducks must be a non-negative number");
        }

        const user = await AdminService.setPlayerDucks(id, ducks);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player ducks updated", {
            id: user.id,
            name: user.name,
            ducks: user.ducks,
        });
    }

    /** Add a non-negative amount of money to a player. */
    @Post("players/{id}/add-money")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player money added",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24",
            "money": 5500
        },
        "timestamp": "2026-06-29T21:29:14.619Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid money value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async addPlayerMoney(
        @Path() id: string,
        @Body() body: AddPlayerMoneyBody
    ): Promise<ApiResponseFormat> {
        const { money } = body;

        if (money === undefined || money < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Money must be a non-negative number");
        }

        const user = await AdminService.addPlayerMoney(id, money);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player money added", {
            id: user.id,
            name: user.name,
            money: user.money,
        });
    }

    /** Add a non-negative amount of ducks to a player. */
    @Post("players/{id}/add-ducks")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player ducks added",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24",
            "ducks": 300
        },
        "timestamp": "2026-06-29T21:29:20.304Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid duck value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async addPlayerDucks(
        @Path() id: string,
        @Body() body: AddPlayerDucksBody
    ): Promise<ApiResponseFormat> {
        const { ducks } = body;

        if (ducks === undefined || ducks < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Ducks must be a non-negative number");
        }

        const user = await AdminService.addPlayerDucks(id, ducks);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player ducks added", {
            id: user.id,
            name: user.name,
            ducks: user.ducks,
        });
    }

    /** Remove a non-negative amount of money from a player. */
    @Post("players/{id}/remove-money")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player money removed",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24",
            "money": 5400
        },
        "timestamp": "2026-06-29T21:29:25.779Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid money value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async removePlayerMoney(
        @Path() id: string,
        @Body() body: RemovePlayerMoneyBody
    ): Promise<ApiResponseFormat> {
        const { money } = body;

        if (money === undefined || money < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Money must be a non-negative number");
        }

        const user = await AdminService.removePlayerMoney(id, money);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player money removed", {
            id: user.id,
            name: user.name,
            money: user.money,
        });
    }

    /** Remove a non-negative amount of ducks from a player. */
    @Post("players/{id}/remove-ducks")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Player ducks removed",
        "data": {
            "id": "cmqzqam230000wcklml34pih0",
            "name": "Mackenzie.Bogisich24",
            "ducks": 290
        },
        "timestamp": "2026-06-29T21:29:36.937Z"
    })
    @Response<ApiResponseFormat>(400, "Invalid duck value")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    @Response<ApiResponseFormat>(404, "Player not found")
    public async removePlayerDucks(
        @Path() id: string,
        @Body() body: RemovePlayerDucksBody
    ): Promise<ApiResponseFormat> {
        const { ducks } = body;

        if (ducks === undefined || ducks < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Ducks must be a non-negative number");
        }

        const user = await AdminService.removePlayerDucks(id, ducks);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player ducks removed", {
            id: user.id,
            name: user.name,
            ducks: user.ducks,
        });
    }

    /** Ban an IP address from accessing the API. */
    @Post("ip/ban")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "IP banned",
        "data": {
            "ipAddress": "203.0.113.42"
        },
        "timestamp": "2026-06-29T21:29:43.054Z"
    })
    @Response<ApiResponseFormat>(400, "Missing IP address")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async banIP(@Body() body: IPBanBody): Promise<ApiResponseFormat> {
        const { ipAddress } = body;

        if (!ipAddress) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "IP address is required");
        }

        await AdminService.ipBanned(body.ipAddress);

        return ApiResponse.success("IP banned", {
            ipAddress: body.ipAddress,
        });
    }

    /** Remove a ban from an IP address. */
    @Post("ip/unban")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "IP unbanned",
        "data": {
            "ipAddress": "203.0.113.42"
        },
        "timestamp": "2026-06-29T21:29:48.875Z"
    })
    @Response<ApiResponseFormat>(400, "Missing IP address")
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async unbanIP(@Body() body: IPBanBody): Promise<ApiResponseFormat> {
        const { ipAddress } = body;

        if (!ipAddress) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "IP address is required");
        }

        await AdminService.ipUnbanned(body.ipAddress);

        return ApiResponse.success("IP unbanned", {
            ipAddress: body.ipAddress,
        });
    }

    /** Get a list of all banned IP addresses. */
    @Get("ip/banned")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Banned IPs fetched",
        "data": [
            {
                "ipAddress": "203.0.113.42",
                "bannedAt": "2026-06-29T21:34:34.434Z"
            }
        ],
        "timestamp": "2026-06-29T21:34:38.258Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getBannedIPs(): Promise<ApiResponseFormat> {
        const bannedIps = await AdminService.getBannedIps();

        const formattedBannedIps = bannedIps.map((ban) => ({
            ipAddress: ban.ipAddress,
            bannedAt: ban.bannedAt,
        }));

        return ApiResponse.success("Banned IPs fetched", formattedBannedIps);
    }

    /** Get global game totals and host resource statistics for the admin dashboard. */
    @Get("stats")
    @Security("adminAuth")
    @Example<ApiResponseFormat>({
        "success": true,
        "message": "Admin stats fetched",
        "data": {
            "players": 1,
            "ducksProduced": "20841",
            "ducksSold": "18047",
            "moneyGenerated": "207485",
            "apiVersion": "v1",
            "uptime": 40346.39,
            "memory": {
                "usedMB": 20139,
                "freeMB": 11986,
                "totalMB": 32125,
                "usagePercent": 62.69
            },
            "cpuUsage": "8.01%"
        },
        "timestamp": "2026-06-29T21:30:04.542Z"
    })
    @Response<ApiResponseFormat>(401, "Unauthorized")
    public async getStats(): Promise<ApiResponseFormat> {
        const load = await systeminformation.currentLoad();
        const mem = await systeminformation.mem();

        const playerCount = await WorldService.countPlayers();
        const worldState = await WorldService.getState();

        return ApiResponse.success("Admin stats fetched", {
            players: playerCount,
            ducksProduced: worldState?.totalDucksProduced ?? "unknown",
            ducksSold: worldState?.totalDucksSold ?? "unknown",
            moneyGenerated: worldState?.totalMoneyGenerated ?? "unknown",
            apiVersion: process.env.API_VERSION || "unknown",
            uptime: os.uptime(),
            memory: {
                usedMB: Math.round(mem.used / 1024 / 1024),
                freeMB: Math.round(mem.free / 1024 / 1024),
                totalMB: Math.round(mem.total / 1024 / 1024),
                usagePercent: Number(((mem.used / mem.total) * 100).toFixed(2)),
            },
            cpuUsage: `${load.currentLoad.toFixed(2)}%`,
        });
    }
}
