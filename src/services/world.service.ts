import { prisma } from "../prisma.js";

export async function addTotalDucksProduced(amount: number) {
    return await prisma.worldState.update({
        where: { id: 1 },
        data: {
            totalDucksProduced: {
                increment: amount,
            },
        },
    });
}

export async function addTotalDucksSold(amount: number) {
    return await prisma.worldState.update({
        where: { id: 1 },
        data: {
            totalDucksSold: {
                increment: amount,
            },
        },
    });
}

export async function addTotalMoneyGenerated(amount: number) {
    return await prisma.worldState.update({
        where: { id: 1 },
        data: {
            totalMoneyGenerated: {
                increment: amount,
            },
        },
    });
}

export async function getState() {
    return await prisma.worldState.findUnique({
        where: { id: 1 },
        select: {
            totalDucksProduced: true,
            totalDucksSold: true,
            totalMoneyGenerated: true,
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
