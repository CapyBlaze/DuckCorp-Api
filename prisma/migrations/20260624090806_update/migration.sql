/*
  Warnings:

  - You are about to alter the column `totalMoneyGenerated` on the `Player` table. The data in that column could be lost. The data in that column will be cast from `Float` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ducks" REAL NOT NULL,
    "money" REAL NOT NULL,
    "lastSync" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalDucksProduced" BIGINT NOT NULL DEFAULT 0,
    "totalDucksSold" BIGINT NOT NULL DEFAULT 0,
    "totalMoneyGenerated" BIGINT NOT NULL DEFAULT 0,
    "totalBuildings" INTEGER NOT NULL DEFAULT 0,
    "totalStorage" INTEGER NOT NULL DEFAULT 0,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Player" ("active", "createdAt", "ducks", "id", "lastActive", "lastSync", "money", "name", "token", "totalBuildings", "totalDucksProduced", "totalDucksSold", "totalMoneyGenerated", "totalStorage", "updatedAt") SELECT "active", "createdAt", "ducks", "id", "lastActive", "lastSync", "money", "name", "token", "totalBuildings", "totalDucksProduced", "totalDucksSold", "totalMoneyGenerated", "totalStorage", "updatedAt" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
CREATE UNIQUE INDEX "Player_token_key" ON "Player"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
