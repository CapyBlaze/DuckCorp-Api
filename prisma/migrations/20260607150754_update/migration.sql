/*
  Warnings:

  - You are about to drop the column `influence` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `reputation` on the `Player` table. All the data in the column will be lost.
  - You are about to drop the column `researchPoints` on the `Player` table. All the data in the column will be lost.
  - The primary key for the `PlayerBuilding` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PlayerBuilding` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "PlayerStorage" (
    "storageId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("storageId", "playerId"),
    CONSTRAINT "PlayerStorage_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ducks" INTEGER NOT NULL DEFAULT 0,
    "money" REAL NOT NULL DEFAULT 100.0,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Player" ("active", "createdAt", "ducks", "id", "lastActive", "money", "name", "token", "updatedAt") SELECT "active", "createdAt", "ducks", "id", "lastActive", "money", "name", "token", "updatedAt" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
CREATE UNIQUE INDEX "Player_token_key" ON "Player"("token");
CREATE TABLE "new_PlayerBuilding" (
    "buildingId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("buildingId", "playerId"),
    CONSTRAINT "PlayerBuilding_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlayerBuilding" ("amount", "buildingId", "createdAt", "playerId", "updatedAt") SELECT "amount", "buildingId", "createdAt", "playerId", "updatedAt" FROM "PlayerBuilding";
DROP TABLE "PlayerBuilding";
ALTER TABLE "new_PlayerBuilding" RENAME TO "PlayerBuilding";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
