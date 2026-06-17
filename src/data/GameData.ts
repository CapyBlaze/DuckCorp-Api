import { loadJsonData } from "../utils/loadJson.js";


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
    category: "production" | "buildings" | "wealth" | "?????";
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




class GameData {
    achievements: AchievementItem[];
    buildings: BuildingItem[];
    storages: StorageItem[];

    constructor() {
        this.achievements = loadJsonData("achievements.json");
        this.buildings = loadJsonData("buildings.json");
        this.storages = loadJsonData("storages.json");
    }
}

export const gameData = new GameData();
