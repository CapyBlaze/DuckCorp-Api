import { gameConfig } from "../config/GameConfig.js";
import { prisma } from "../prisma.js";
import { getProductionPerMinute } from "./building.service.js";
import { getMaxStorageCapacity } from "./storage.service.js";
import { addTotalDucksProduced } from "./world.service.js";


export async function processOfflineProduction(playerId: string) {
    const now = Date.now();
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
            lastSync: true,
            ducks: true
        }
    });

    if (!player) {
        return -1;
    }
    
    const minutesOffline = Math.min((now - player.lastSync.getTime()) / 60000, gameConfig.config.maxOfflineHours * 60);
    const productionPerMinute = await getProductionPerMinute(playerId);
    const maxStorageCapacity = await getMaxStorageCapacity(playerId);

    const totalProduction = productionPerMinute * minutesOffline;
    const newDucks = Math.min(player.ducks + totalProduction, maxStorageCapacity);
    const actualProduced = Math.max(0, newDucks - player.ducks);
    
    await prisma.player.update({
        where: { id: playerId },
        data: { 
            ducks: newDucks,
            lastSync: new Date(),
            totalDucksProduced: {
                increment: actualProduced
            }
        }
    });

    await addTotalDucksProduced(actualProduced);

    return Math.floor(newDucks);
}