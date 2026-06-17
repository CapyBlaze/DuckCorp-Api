import { Body, Controller, Delete, Get, Path, Post, Put, Query, Route, Security, Tags } from "tsoa";
import { ApiResponse, type ApiResponseFormat } from "../utils/apiResponse.js";
import { getPlayersPaginated, getPlayer, loginAdmin, deleteUserById, resetPlayerData, setPlayerDataMoney, setPlayerDataDucks, addPlayerDataDucks, addPlayerDataMoney, removePlayerDataMoney, removePlayerDataDucks, ipUnbanned, ipBanned, countPlayers } from "../services/admin.service.js";
import { processOfflineProduction } from "../services/duck.service.js";
import { getPlayerBuildings, getProductionPerMinute } from "../services/building.service.js";
import { getMaxStorageCapacity, getPlayerStorages } from "../services/storage.service.js";
import { getPlayerAchievements } from "../services/achievement.service.js";
import { gameConfig } from "../config/GameConfig.js";
import os from "os";
import systeminformation from "systeminformation";
import { getWorldState } from "../services/world.service.js";



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
    /**  */
    @Post("login")
    public async login(@Body() body: RegisterAdminBody): Promise<ApiResponseFormat> {
        const { username, password } = body;

        if (!username || !password) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "Username and password are required");
        }

        const token = await loginAdmin(username, password);

        this.setStatus(201);
        return ApiResponse.success("User logged in", {
            token: token,
            name: username,
        });
    }


    /** */
    @Get("config")
    @Security("adminAuth")
    public async getConfig(): Promise<ApiResponseFormat> {
        return ApiResponse.success(
            "Game configuration retrieved successfully",
            gameConfig.config
        );
    }


    /** */
    @Put("config")
    @Security("adminAuth")
    public async updateConfig(@Body() body: ConfigUpdateBody): Promise<ApiResponseFormat> {
        const { startingValues, maxOfflineHours, marketUpdateIntervalMs, duckPriceFluctuation } = body;

        if (startingValues !== undefined) {
            if (startingValues?.ducks !== undefined && startingValues.ducks < 0) {
                this.setStatus(400);
                return ApiResponse.error("Invalid value", "startingValues.ducks must be a non-negative number");
            }

            if (startingValues?.money !== undefined && startingValues.money < 0) {
                this.setStatus(400);
                return ApiResponse.error("Invalid value", "startingValues.money must be a non-negative number");
            }

            gameConfig.config.startingValues = {
                ...gameConfig.config.startingValues,
                ...startingValues,
            };
        }

        if (maxOfflineHours !== undefined) {
            if (maxOfflineHours < 0) {
                this.setStatus(400);
                return ApiResponse.error("Invalid value", "maxOfflineHours must be a non-negative number");
            }

            gameConfig.config.maxOfflineHours = maxOfflineHours;
        }

        if (marketUpdateIntervalMs !== undefined) {
            gameConfig.config.marketUpdateIntervalMs = marketUpdateIntervalMs;
        }

        if (duckPriceFluctuation !== undefined) {
            if (duckPriceFluctuation.min > duckPriceFluctuation.max || duckPriceFluctuation.min < 0) {
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
     * -
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
    public async getPlayers(
        @Query() page?: number,
        @Query('limit') pageSize?: number
    ): Promise<ApiResponseFormat> {
        if (!page || page < 1) page = 1;
        if (!pageSize || pageSize < 1) pageSize = 10;
        if (pageSize > 500) pageSize = 500;

        
        const players = await getPlayersPaginated(page, pageSize);

        let data = [];
        for (const player of players) {
            const [ducksAfterSync, buildings, storages, achievements] = await Promise.all([
                processOfflineProduction(player.id),
                getPlayerBuildings(player.id),
                getPlayerStorages(player.id),
                getPlayerAchievements(player.id),
            ]);

            const [productionPerMinute, maxStorageCapacity] = await Promise.all([
                getProductionPerMinute(player.id),
                getMaxStorageCapacity(player.id),
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
                achievements: achievements
            });
        }

        return ApiResponse.success("Player data retrieved", data);
    }


    /**  */
    @Get("players/{id}")
    @Security("adminAuth")
    public async getPlayerById(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await getPlayer(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }


        const [ducksAfterSync, buildings, storages, achievements] = await Promise.all([
            processOfflineProduction(user.id),
            getPlayerBuildings(user.id),
            getPlayerStorages(user.id),
            getPlayerAchievements(user.id),
        ]);

        const [productionPerMinute, maxStorageCapacity] = await Promise.all([
            getProductionPerMinute(user.id),
            getMaxStorageCapacity(user.id),
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
            achievements: achievements
        });
    }


    /**  */
    @Delete("players/{id}")
    @Security("adminAuth")
    public async deletePlayer(@Path() id: string): Promise<ApiResponseFormat> {
        const user = await deleteUserById(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player deleted", { 
            id: user.id,
            name: user.name
        });
    }


    /**  */
    @Post("players/{id}/reset")
    @Security("adminAuth")
    public async resetPlayer(
        @Path() id: string, 
    ): Promise<ApiResponseFormat> {
        const user = await resetPlayerData(id);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player reset", { 
            id: user.id,
            name: user.name
        });
    }


    /**  */
    @Post("players/{id}/money")
    @Security("adminAuth")
    public async setPlayerMoney(
        @Path() id: string, 
        @Body() body: SetPlayerMoneyBody
    ): Promise<ApiResponseFormat> {
        const { money } = body;

        if (money === undefined || money < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Money must be a non-negative number");
        }

        const user = await setPlayerDataMoney(id, money);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player money updated", { 
            id: user.id, 
            name: user.name, 
            money: user.money 
        });
    }


    /**  */
    @Post("players/{id}/ducks")
    @Security("adminAuth")
    public async setPlayerDucks(
        @Path() id: string, 
        @Body() body: SetPlayerDucksBody
    ): Promise<ApiResponseFormat> {
        const { ducks } = body;

        if (ducks === undefined || ducks < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Ducks must be a non-negative number");
        }

        const user = await setPlayerDataDucks(id, ducks);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player ducks updated", { 
            id: user.id, 
            name: user.name, 
            ducks: user.ducks 
        });
    }


    /**  */
    @Post("players/{id}/add-money")
    @Security("adminAuth")
    public async addPlayerMoney(
        @Path() id: string, 
        @Body() body: AddPlayerMoneyBody
    ): Promise<ApiResponseFormat> {
        const { money } = body;

        if (money === undefined || money < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Money must be a non-negative number");
        }

        const user = await addPlayerDataMoney(id, money);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player money added", { 
            id: user.id, 
            name: user.name, 
            money: user.money 
        });
    }


    /**  */
    @Post("players/{id}/add-ducks")
    @Security("adminAuth")
    public async addPlayerDucks(
        @Path() id: string, 
        @Body() body: AddPlayerDucksBody
    ): Promise<ApiResponseFormat> {
        const { ducks } = body;

        if (ducks === undefined || ducks < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Ducks must be a non-negative number");
        }

        const user = await addPlayerDataDucks(id, ducks);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player ducks added", { 
            id: user.id, 
            name: user.name, 
            ducks: user.ducks 
        });
    }


    /**  */
    @Post("players/{id}/remove-money")
    @Security("adminAuth")
    public async removePlayerMoney(
        @Path() id: string, 
        @Body() body: RemovePlayerMoneyBody
    ): Promise<ApiResponseFormat> {
        const { money } = body;

        if (money === undefined || money < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Money must be a non-negative number");
        }

        const user = await removePlayerDataMoney(id, money);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player money removed", { 
            id: user.id, 
            name: user.name, 
            money: user.money 
        });
    }


    /**  */
    @Post("players/{id}/remove-ducks")
    @Security("adminAuth")
    public async removePlayerDucks(
        @Path() id: string, 
        @Body() body: RemovePlayerDucksBody
    ): Promise<ApiResponseFormat> {
        const { ducks } = body;

        if (ducks === undefined || ducks < 0) {
            this.setStatus(400);
            return ApiResponse.error("Invalid value", "Ducks must be a non-negative number");
        }

        const user = await removePlayerDataDucks(id, ducks);

        if (!user) {
            this.setStatus(404);
            return ApiResponse.error("Player not found", "No player exists with the provided ID");
        }

        return ApiResponse.success("Player ducks removed", { 
            id: user.id, 
            name: user.name, 
            ducks: user.ducks 
        });
    }


    /**  */
    @Post("ip/ban")
    @Security("adminAuth")
    public async banIP(
        @Body() body: IPBanBody
    ): Promise<ApiResponseFormat> {
        const { ipAddress } = body;

        if (!ipAddress) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "IP address is required");
        }
        
        await ipBanned(body.ipAddress);

        return ApiResponse.success("IP banned", {
            ipAddress: body.ipAddress
        });
    }


    /**  */
    @Post("ip/unban")
    @Security("adminAuth")
    public async unbanIP(
        @Body() body: IPBanBody
    ): Promise<ApiResponseFormat> {
        const { ipAddress } = body;

        if (!ipAddress) {
            this.setStatus(400);
            return ApiResponse.error("Information missing", "IP address is required");
        }

        await ipUnbanned(body.ipAddress);

        return ApiResponse.success("IP unbanned", {
            ipAddress: body.ipAddress
        });
    }


    /**  */
    @Get("stats")
    @Security("adminAuth")
    public async getStats(): Promise<ApiResponseFormat> {
        const load = await systeminformation.currentLoad();
        const mem = await systeminformation.mem();

        const playerCount = await countPlayers();
        const worldState = await getWorldState();

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
                usagePercent: Number(
                    ((mem.used / mem.total) * 100).toFixed(2)
                )
            },
            cpuUsage: `${load.currentLoad.toFixed(2)}%`
        });
    }
}
