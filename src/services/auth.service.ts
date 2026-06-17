import { gameConfig } from "../config/GameConfig.js";
import { prisma } from "../prisma.js";
import crypto from "crypto";

export async function registerUser(name: string) {
    let player = await prisma.player.findUnique({
        where: { name }
    });

    if (player) return player;

    return await prisma.player.create({
        data: {
            name,
            token: crypto.randomUUID(),
            ducks: gameConfig.config.startingValues.ducks,
            money: gameConfig.config.startingValues.money
        }
    });
}

export async function getUserById(id: string) {
    const player = await prisma.player.findUnique({
        where: { id }
    });

    return player;
}

export async function deleteUserById(id: string) {
    await prisma.player.update({
        where: { id },
        data: { active: false }
    });
}
