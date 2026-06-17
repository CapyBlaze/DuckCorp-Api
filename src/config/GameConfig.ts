import { loadJsonConfig } from "../utils/loadJson.js";
import { saveJsonConfig } from "../utils/saveJson.js";


export interface Config {
    startingValues: {
        ducks: number,
        money: number
    },
    maxOfflineHours: number,
    marketUpdateIntervalMs: number,
    duckPriceFluctuation: {
        min: number,
        max: number
    },
}



class GameConfig {
    config: Config;

    constructor() {
        this.config = loadJsonConfig("index.json");
    }

    async save() {
        saveJsonConfig("index.json", this.config);
    }
}

export const gameConfig = new GameConfig();
