import type { Player } from "@prisma/client";
import { prisma } from "../prisma.js";
import { gameData, type AchievementItem } from "../data/GameData.js";

export async function playerAchievements(playerId: string) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        include: {
            achievements: true,
        },
    });

    return player?.achievements || [];
}

export async function achievements() {
    const achievements: AchievementItem[] = [];
    for (const achievement of gameData.achievements) {
        if (!achievement.hidden) {
            achievements.push(achievement);
        } else {
            achievements.push({
                ...achievement,
                category: "?????",
                name: { fr: "?????", en: "?????" },
                description: { fr: "?????", en: "?????" },
                condition: {
                    type: "?????",
                    value: 0,
                },
            });
        }
    }

    return achievements;
}

export async function check(player: Player) {
    for (const achievement of gameData.achievements) {
        const alreadyUnlocked = await prisma.playerAchievement.findUnique({
            where: {
                achievementId_playerId: {
                    playerId: player.id,
                    achievementId: achievement.id,
                },
            },
        });

        if (alreadyUnlocked) {
            continue;
        }

        if (isUnlocked(player, achievement)) {
            await unlock(player, achievement);
        }
    }
}

function isUnlocked(player: Player, achievement: AchievementItem): boolean {
    switch (achievement.condition.type) {
        case "total_ducks_produced":
            return player.totalDucksProduced >= achievement.condition.value;

        case "buildings_owned":
            return player.totalBuildings >= achievement.condition.value;

        case "ducks_sold":
            return player.totalDucksSold >= achievement.condition.value;

        case "money_owned":
            return player.money >= achievement.condition.value;

        default:
            return false;
    }
}

async function unlock(player: Player, achievement: AchievementItem) {
    await prisma.playerAchievement.create({
        data: {
            playerId: player.id,
            achievementId: achievement.id,
        },
    });

    if (achievement.reward?.money) {
        await prisma.player.update({
            where: { id: player.id },
            data: {
                money: {
                    increment: achievement.reward.money,
                },
            },
        });
    }

    if (achievement.reward?.ducks) {
        await prisma.player.update({
            where: { id: player.id },
            data: {
                totalDucksProduced: {
                    increment: achievement.reward.ducks,
                },
            },
        });
    }
}
