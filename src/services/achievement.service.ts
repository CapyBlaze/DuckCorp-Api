import { prisma } from "../prisma.js";

export async function getPlayerAchievements(playerId: string) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: {
            achievements: true
        }
    });
    
    return player?.achievements || [];
}