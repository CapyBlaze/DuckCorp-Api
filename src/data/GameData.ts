import { loadJson } from "../utils/loadJson.js";


export interface Translation {
  en: string;
  fr: string;
}

export type UnknownTranslation = Record<keyof Translation, unknown>;

export function unknownTranslation(): UnknownTranslation {
    const reference: Translation = { en: "", fr: "" };

    return Object.keys(reference).reduce((acc, key) => {
        acc[key as keyof Translation] = "unknown";
        return acc;
    }, {} as UnknownTranslation);
}



export interface BuildingItem {
  id: string;
  name: Translation;
  cost: number;
  production: number;
}

export interface StorageItem {
    id: string;
    name: Translation;
    cost: number;
    storageCapacity: number;
}

export interface AchievementItem {
    id: string;
    hidden: boolean;
    name: Translation;
    description: Translation;
    condition: {
        type: string;
        value: number;
    };
    reward: {
        money?: number;
        ducks?: number;
    };
}

export interface AchievementList {
    production: AchievementItem[];
    buildings: AchievementItem[];
    wealth: AchievementItem[];
}



class GameData {
    achievements: AchievementList;
    buildings: BuildingItem[];
    storages: StorageItem[];

    constructor() {
        this.achievements = { production: [], buildings: [], wealth: [] };
        this.buildings = [];
        this.storages = [];
    }

    load() {
        this.achievements = loadJson("achievements.json");
        this.buildings = loadJson("buildings.json");
        this.storages = loadJson("storages.json");
    }
}

export const gameData = new GameData();
gameData.load();
