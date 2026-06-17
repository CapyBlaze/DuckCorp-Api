import { gameConfig } from "../config/GameConfig.js";
import { prisma } from "../prisma.js";
import { processOfflineProduction } from "./duck.service.js";
import { addTotalDucksSold, addTotalMoneyGenerated } from "./world.service.js";


export function getDuckPrice(time: number = Date.now()) {
    const t = Math.floor(time / gameConfig.config.marketUpdateIntervalMs);

    const minPrice = gameConfig.config.duckPriceFluctuation.min;
    const maxPrice = gameConfig.config.duckPriceFluctuation.max;
    const base = (minPrice + maxPrice) / 2; 

    const trend = Math.sin(t * 0.7) * 6;
    const noise = Math.sin(t * 3.1) * 2;

    let price = base + trend + noise;
    price = +Math.max(minPrice, Math.min(maxPrice, price)).toFixed(3);

    return price;
}

export async function sellDucksForPlayer(playerId: string) {
    const duckPrice = getDuckPrice();

    await processOfflineProduction(playerId);

    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: { ducks: true, money: true }
    });


    if (!player) {
        return {
            ducks: 0,
            duckPrice: duckPrice,
            earnings: 0
        };
    }

    player.ducks = Math.floor(player.ducks);
    if (player.ducks <= 0) {
        return {
            ducksSold: 0,
            duckPrice: duckPrice,
            earnings: 0
        };
    }


    const earnings = player.ducks * duckPrice;
    await prisma.player.update({
        where: { id: playerId },
        data: {
            ducks: 0,
            money: player.money + earnings
        }
    });

    await addTotalDucksSold(player.ducks);
    await addTotalMoneyGenerated(earnings);

    return {
        ducksSold: player.ducks,
        duckPrice: duckPrice,
        earnings: earnings
    };
}

export function getPriceHistory() {
    let historicalPrices: number[] = [];
    const t = Date.now();

    for (let time = t - (gameConfig.config.marketUpdateIntervalMs * 100); time < t; time += gameConfig.config.marketUpdateIntervalMs) {
        let price = getDuckPrice(time);
        historicalPrices.push(price);
    }

    return historicalPrices;
}