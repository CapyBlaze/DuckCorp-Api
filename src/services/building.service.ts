import { prisma } from "../prisma.js";
import { type Translation, gameData, unknownTranslation } from "../data/GameData.js";

export enum BuyResult {
    Success,
    PlayerNotFound,
    NotEnoughMoney,
    BuildingNotFound,
}

type BuySuccess = {
    result: BuyResult.Success;
    name: Translation;
    playerMoney: number;
    amount: number;
    productionPerMinute: number;
    cost: number;
};

type BuyResponse = BuySuccess | { result: Exclude<BuyResult, BuyResult.Success> };

export async function buy(playerId: string, buildingId: string): Promise<BuyResponse> {
    const building = gameData.buildings.find((b: any) => b.id === buildingId);
    if (!building) {
        return { result: BuyResult.BuildingNotFound };
    }

    const result = await prisma.$transaction(async (tx) => {
        const player = await tx.player.findUnique({
            where: { id: playerId },
            select: { money: true },
        });

        if (!player) {
            return { result: BuyResult.PlayerNotFound as const };
        }

        if (player.money < building.cost) {
            return { result: BuyResult.NotEnoughMoney as const };
        }

        await tx.player.update({
            where: { id: playerId },
            data: {
                money: {
                    decrement: building.cost,
                },
                totalBuildings: {
                    increment: 1,
                },
            },
        });

        const upserted = await tx.playerBuilding.upsert({
            where: {
                buildingId_playerId: {
                    playerId,
                    buildingId,
                },
            },
            update: {
                amount: {
                    increment: 1,
                },
            },
            create: {
                playerId,
                buildingId,
                amount: 1,
            },
        });

        const updatedPlayer = await tx.player.findUnique({
            where: { id: playerId },
            select: { money: true },
        });

        return {
            result: BuyResult.Success,
            name: building.name,
            playerMoney: updatedPlayer!.money,
            amount: upserted.amount,
            productionPerMinute: +(building.production * upserted.amount * 60).toFixed(2),
            cost: building.cost,
        };
    });

    return result;
}

export async function getPlayer(playerId: string) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: {
            buildings: {
                select: {
                    buildingId: true,
                    amount: true,
                },
            },
        },
    });

    const buildings = (player?.buildings || []).map((b) => {
        const buildingData = gameData.buildings.find((bd) => bd.id === b.buildingId);

        if (!buildingData)
            return {
                buildingId: b.buildingId,
                name: unknownTranslation(),
                amount: b.amount,
                productionPerMinute: +(0).toFixed(2),
            };

        return {
            buildingId: b.buildingId,
            name: buildingData?.name ?? unknownTranslation(),
            amount: b.amount,
            productionPerMinute: +(buildingData?.production * b.amount * 60).toFixed(2),
        };
    });

    return buildings;
}

export async function getProductionPerMinute(playerId: string) {
    const buildings = await getPlayer(playerId);
    const totalProduction = buildings.reduce((acc, b) => acc + b.productionPerMinute, 0);
    return +totalProduction.toFixed(2);
}
