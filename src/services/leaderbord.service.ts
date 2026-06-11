import { prisma } from "../prisma.js";
import { getProductionPerMinute } from "./building.service.js";
import { getMaxStorageCapacity } from "./storage.service.js";


export async function playersByDucks() {
    return prisma.player.findMany({
        take: 10,
        orderBy: {
            ducks: "desc"
        },
        select: {
            name: true,
            ducks: true
        }
    });
}

export async function playersByMoney() {
    return prisma.player.findMany({
        take: 10,
        orderBy: {
            money: "desc"
        },
        select: {
            name: true,
            money: true
        }
    });
}

export async function playersByProduction() {
    const players = await prisma.player.findMany({
        take: 10,
        select: {
            id: true,
            name: true,
        }
    });

    const playersWithProduction = await Promise.all(players.map(async (player) => {
        const productionPerMinute = await getProductionPerMinute(player.id);
        return {
            name: player.name,
            productionPerMinute
        };
    }));

    return playersWithProduction.sort((a, b) => b.productionPerMinute - a.productionPerMinute);
}

export async function playersByStorage() {
    const players = await prisma.player.findMany({
        take: 10,
        select: {
            id: true,
            name: true,
        }
    });

    const playersWithStorage = await Promise.all(players.map(async (player) => {
        const maxStorageCapacity = await getMaxStorageCapacity(player.id);
        return {
            name: player.name,
            maxStorageCapacity
        };
    }));

    return playersWithStorage.sort((a, b) => b.maxStorageCapacity - a.maxStorageCapacity);
}

export async function playersByNbBuildings() {
    const players = await prisma.player.findMany({
        take: 10,
        select: {
            id: true,
            name: true,
            buildings: {
                select: {
                    amount: true
                }
            }
        }
    });

    const playersWithNbBuildings = players.map((player) => {
        const totalBuildings = player.buildings.reduce((acc, b) => acc + b.amount, 0);
        return {
            name: player.name,
            totalBuildings
        };
    });

    return playersWithNbBuildings.sort((a, b) => b.totalBuildings - a.totalBuildings);
}

export async function playersByNbStorage() {
    const players = await prisma.player.findMany({
        take: 10,
        select: {
            id: true,
            name: true,
            storages: {
                select: {
                    amount: true
                }
            }
        }
    });

    const playersWithNbStorages = players.map((player) => {
        const totalStorages = player.storages.reduce((acc, s) => acc + s.amount, 0);
        return {
            name: player.name,
            totalStorages
        };
    });

    return playersWithNbStorages.sort((a, b) => b.totalStorages - a.totalStorages);
}
