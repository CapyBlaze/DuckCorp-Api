import { prisma } from "../prisma.js";

import { gameConfig } from "../config/GameConfig.js";
import { HttpError } from "../middlewares/error.middleware.js";

export const adminSessions = new Map<
    string,
    {
        createdAt: Date;
        expiresAt: Date;
    }
>();

export async function login(username: string, password: string) {
    const usernameEnv = process.env.ADMIN_USERNAME || "admin";
    const passwordEnv = process.env.ADMIN_PASSWORD || crypto.randomUUID();

    if (username !== usernameEnv || password !== passwordEnv) {
        throw new HttpError(401, "Invalid Credentials", "Invalid username or password");
    }

    let token = crypto.randomUUID();

    adminSessions.set(token, {
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24h
    });

    return token;
}

export async function players(page: number = 1, pageSize: number = 10) {
    return prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
            name: "asc",
        },
        select: {
            id: true,
            name: true,
            money: true,
            ducks: true,
            active: true,
            lastSync: true,
            lastActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function getPlayer(id: string) {
    return await prisma.player.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            money: true,
            ducks: true,
            active: true,
            lastSync: true,
            lastActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function deletePlayer(id: string) {
    return await prisma.player.update({
        where: { id },
        data: { active: false },
        select: {
            id: true,
            name: true,
        },
    });
}

export async function resetPlayer(id: string) {
    return await prisma.player.update({
        where: { id },
        data: {
            money: gameConfig.config.startingValues.money,
            ducks: gameConfig.config.startingValues.ducks,
            lastSync: new Date(),
            lastActive: new Date(),

            buildings: {
                deleteMany: {},
            },
            storages: {
                deleteMany: {},
            },
            achievements: {
                deleteMany: {},
            },
        },
        select: {
            id: true,
            name: true,
        },
    });
}

export async function setPlayerMoney(id: string, money: number) {
    return await prisma.player.update({
        where: { id },
        data: {
            money,
        },
        select: {
            id: true,
            name: true,
            money: true,
        },
    });
}

export async function setPlayerDucks(id: string, ducks: number) {
    return await prisma.player.update({
        where: { id },
        data: {
            ducks,
        },
        select: {
            id: true,
            name: true,
            ducks: true,
        },
    });
}

export async function addPlayerMoney(id: string, amount: number) {
    return await prisma.player.update({
        where: { id },
        data: {
            money: {
                increment: amount,
            },
        },
        select: {
            id: true,
            name: true,
            money: true,
        },
    });
}

export async function addPlayerDucks(id: string, amount: number) {
    return await prisma.player.update({
        where: { id },
        data: {
            ducks: {
                increment: amount,
            },
        },
        select: {
            id: true,
            name: true,
            ducks: true,
        },
    });
}

export async function removePlayerMoney(id: string, amount: number) {
    const player = await prisma.player.findUnique({
        where: { id },
        select: { money: true },
    });

    if (!player) return;

    const newMoneyValue = Math.max(0, player.money - amount);

    return await prisma.player.update({
        where: { id },
        data: {
            money: newMoneyValue,
        },
        select: {
            id: true,
            name: true,
            money: true,
        },
    });
}

export async function removePlayerDucks(id: string, amount: number) {
    const player = await prisma.player.findUnique({
        where: { id },
        select: { ducks: true },
    });

    if (!player) return;

    const newDucksValue = Math.max(0, player.ducks - amount);

    return await prisma.player.update({
        where: { id },
        data: {
            ducks: newDucksValue,
        },
        select: {
            id: true,
            name: true,
            ducks: true,
        },
    });
}

export async function ipBanned(ipAddress: string) {
    return await prisma.ipBan.create({
        data: {
            ipAddress,
        },
    });
}

export async function ipUnbanned(ipAddress: string) {
    return await prisma.ipBan.delete({
        where: {
            ipAddress,
        },
    });
}

export async function getBannedIps() {
    return await prisma.ipBan.findMany({
        select: {
            ipAddress: true,
            bannedAt: true,
        },
    });
}

export async function countPlayers() {
    return await prisma.player.count({
        where: {
            active: true,
        },
    });
}
