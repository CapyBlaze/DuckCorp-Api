import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function loadJsonData(fileName: string) {
    const filePath = path.join(__dirname, "../data", fileName);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}

export function loadJsonConfig(fileName: string) {
    const filePath = path.join(__dirname, "../config", fileName);
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}
