import { prisma } from "../prisma.js";
import * as BuildingService from "./building.service.js";
import * as StorageService from "./storage.service.js";



export async function playersByDucks(page: number = 1, pageSize: number = 10) {
    return prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
            ducks: "desc"
        },
        select: {
            name: true,
            ducks: true
        }
    });
}

export async function playersByMoney(page: number = 1, pageSize: number = 10) {
    return prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: {
            money: "desc"
        },
        select: {
            name: true,
            money: true
        }
    });
}

export async function playersByProduction(page: number = 1, pageSize: number = 10) {
    const players = await prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
            id: true,
            name: true,
        }
    });

    const playersWithProduction = await Promise.all(players.map(async (player) => {
        const productionPerMinute = await BuildingService.getProductionPerMinute(player.id);
        return {
            name: player.name,
            productionPerMinute
        };
    }));

    return playersWithProduction.sort((a, b) => b.productionPerMinute - a.productionPerMinute);
}

export async function playersByStorage(page: number = 1, pageSize: number = 10) {
    const players = await prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
            id: true,
            name: true,
        }
    });

    const playersWithStorage = await Promise.all(players.map(async (player) => {
        const maxStorageCapacity = await StorageService.getMaxStorageCapacity(player.id);
        return {
            name: player.name,
            maxStorageCapacity
        };
    }));

    return playersWithStorage.sort((a, b) => b.maxStorageCapacity - a.maxStorageCapacity);
}

export async function playersByNbBuildings(page: number = 1, pageSize: number = 10) {
    const players = await prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
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

export async function playersByNbStorage(page: number = 1, pageSize: number = 10) {
    const players = await prisma.player.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
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




export async function getPlayerRank(playerId: string) {
    const targetPlayer = await prisma.player.findUnique({
        where: { id: playerId },
        select: { ducks: true, money: true }
    });

    if (!targetPlayer) {
        throw new Error("Player not found");
    }



    const ducksRank = await prisma.player.count({
        where: { ducks: { gt: targetPlayer.ducks }}
    }) + 1;

    const moneyRank = await prisma.player.count({
        where: { money: { gt: targetPlayer.money }}
    }) + 1;



    const allPlayers = await prisma.player.findMany({
        select: { id: true }
    });

    const productionList = await Promise.all(allPlayers.map(async (p) => ({
        id: p.id,
        score: await BuildingService.getProductionPerMinute(p.id)
    })));
    productionList.sort((a, b) => b.score - a.score);
    const productionRank = productionList.findIndex(p => p.id === playerId) + 1;

    const storageList = await Promise.all(allPlayers.map(async (p) => ({
        id: p.id,
        score: await StorageService.getMaxStorageCapacity(p.id)
    })));
    storageList.sort((a, b) => b.score - a.score);
    const storageRank = storageList.findIndex(p => p.id === playerId) + 1;



    const buildingsPlayers = await prisma.player.findMany({
        select: { id: true, buildings: { select: { amount: true }}}
    });
    const buildingsList = buildingsPlayers.map(p => ({
        id: p.id,
        score: p.buildings.reduce((acc, b) => acc + b.amount, 0)
    })).sort((a, b) => b.score - a.score);
    const nbBuildingsRank = buildingsList.findIndex(p => p.id === playerId) + 1;

    const storagesPlayers = await prisma.player.findMany({
        select: { id: true, storages: { select: { amount: true }}}
    });
    const storagesList = storagesPlayers.map(p => ({
        id: p.id,
        score: p.storages.reduce((acc, s) => acc + s.amount, 0)
    })).sort((a, b) => b.score - a.score);
    const nbStorageRank = storagesList.findIndex(p => p.id === playerId) + 1;



    const rank = productionRank;

    return {
        rank: rank,
        ducksRank: ducksRank,
        moneyRank: moneyRank,
        productionRank: productionRank,
        storageRank: storageRank,
        nbBuildingsRank: nbBuildingsRank,
        nbStorageRank: nbStorageRank
    }
}