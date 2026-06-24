import { prisma } from "../prisma.js";

import * as DuckService from "./duck.service.js";
import * as WorldService from "./world.service.js";

import { gameConfig } from "../config/GameConfig.js";

export function duckPrice(time: number = Date.now()) {
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

export async function sell(playerId: string) {
    const price = duckPrice();

    await DuckService.updateProduction(playerId);

    const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: { ducks: true, money: true },
    });

    if (!player) {
        return {
            ducks: 0,
            duckPrice: price,
            earnings: 0,
        };
    }

    player.ducks = Math.floor(player.ducks);
    if (player.ducks <= 0) {
        return {
            ducksSold: 0,
            duckPrice: price,
            earnings: 0,
        };
    }

    const earnings = player.ducks * price;
    await prisma.player.update({
        where: { id: playerId },
        data: {
            ducks: 0,
            money: player.money + earnings,
            totalDucksSold: {
                increment: Math.floor(player.ducks),
            },
            totalMoneyGenerated: {
                increment: Math.floor(earnings),
            },
        },
    });

    await WorldService.addTotalDucksSold(Math.floor(player.ducks));
    await WorldService.addTotalMoneyGenerated(Math.floor(earnings));

    return {
        ducksSold: player.ducks,
        duckPrice: price,
        earnings: earnings,
    };
}

export function priceHistory() {
    let historicalPrices: number[] = [];
    const t = Date.now();

    for (
        let time = t - gameConfig.config.marketUpdateIntervalMs * 100;
        time < t;
        time += gameConfig.config.marketUpdateIntervalMs
    ) {
        let price = duckPrice(time);
        historicalPrices.push(price);
    }

    return historicalPrices;
}
