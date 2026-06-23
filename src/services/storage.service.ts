import { prisma } from "../prisma.js";
import { type Translation, gameData, unknownTranslation } from "../data/GameData.js";

export enum BuyResult {
    Success,
    PlayerNotFound,
    NotEnoughMoney,
    StorageNotFound,
}

type BuySuccess = {
    result: BuyResult.Success;
    name: Translation;
    playerMoney: number;
    amount: number;
    storageCapacity: number;
    cost: number;
};

type BuyResponse = BuySuccess | { result: Exclude<BuyResult, BuyResult.Success> };

export async function buy(playerId: string, storageId: string): Promise<BuyResponse> {
    const storage = gameData.storages.find((s: any) => s.id === storageId);
    if (!storage) {
        return { result: BuyResult.StorageNotFound };
    }

    const result = await prisma.$transaction(async (tx) => {
        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: { money: true },
        });

        if (!player) {
            return { result: BuyResult.PlayerNotFound as const };
        }

        if (player.money < storage.cost) {
            return { result: BuyResult.NotEnoughMoney as const };
        }

        await tx.player.update({
            where: { id: playerId },
            data: {
                money: {
                    decrement: storage.cost,
                },
                totalStorage: {
                    increment: 1,
                },
            },
        });

        const upserted = await tx.playerStorage.upsert({
            where: {
                storageId_playerId: {
                    playerId,
                    storageId,
                },
            },
            update: {
                amount: {
                    increment: 1,
                },
            },
            create: {
                playerId,
                storageId,
                amount: 1,
            },
        });

        const updatedPlayer = await tx.player.findUnique({
            where: { id: playerId },
            select: { money: true },
        });

        return {
            result: BuyResult.Success,
            name: storage.name,
            playerMoney: updatedPlayer!.money,
            amount: upserted.amount,
            storageCapacity: +(storage.storageCapacity * upserted.amount).toFixed(2),
            cost: storage.cost,
        };
    });

    return result;
}

export async function getPlayer(playerId: string) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
            storages: {
                select: {
                    storageId: true,
                    amount: true,
                },
            },
        },
    });

    const storages = (player?.storages || []).map((s) => {
        const storageData = gameData.storages.find((sd) => sd.id === s.storageId);

        if (!storageData)
            return {
                storageId: s.storageId,
                name: unknownTranslation(),
                amount: s.amount,
                storageCapacity: +(0).toFixed(2),
            };

        return {
            storageId: s.storageId,
            name: storageData?.name ?? unknownTranslation(),
            amount: s.amount,
            storageCapacity: +(storageData.storageCapacity * s.amount).toFixed(2),
        };
    });

    return storages;
}

export async function getMaxStorageCapacity(playerId: string) {
    const storages = await getPlayer(playerId);
    const totalCapacity = storages.reduce((acc, s) => acc + s.storageCapacity, 0);
    return +totalCapacity.toFixed(0);
}
