import { prisma } from "../prisma.js";

import * as BuildingService from "./building.service.js";
import * as StorageService from "./storage.service.js";
import * as WorldServoce from "./world.service.js";

import { gameConfig } from "../config/GameConfig.js";

export async function updateProduction(playerId: string) {
    const now = Date.now();
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
            lastSync: true,
            ducks: true,
        },
    });

    if (!player) {
        return -1;
    }

    const minutesOffline = Math.min(
        (now - player.lastSync.getTime()) / 60000,
        gameConfig.config.maxOfflineHours * 60
    );
    const productionPerMinute = await BuildingService.getProductionPerMinute(playerId);
    const maxStorageCapacity = await StorageService.getMaxStorageCapacity(playerId);

    const totalProduction = productionPerMinute * minutesOffline;
    const newDucks = Math.min(player.ducks + totalProduction, maxStorageCapacity);
    const actualProduced = Math.max(0, newDucks - player.ducks);

    await prisma.player.update({
        where: { id: playerId },
        data: {
            ducks: newDucks,
            lastSync: new Date(),
            totalDucksProduced: {
                increment: Math.floor(actualProduced),
            },
        },
    });

    await WorldServoce.addTotalDucksProduced(Math.floor(actualProduced));

    return Math.floor(newDucks);
}
