/*
  Warnings:

  - You are about to drop the column `marketPrice` on the `WorldState` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorldState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "totalDucksProduced" BIGINT NOT NULL DEFAULT 0,
    "totalDucksSold" BIGINT NOT NULL DEFAULT 0,
    "totalMoneyGenerated" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" DATETIME NOT NULL
);
INSERT INTO "new_WorldState" ("createdAt", "id", "lastUpdate", "totalDucksProduced", "totalDucksSold", "totalMoneyGenerated") SELECT "createdAt", "id", "lastUpdate", "totalDucksProduced", "totalDucksSold", "totalMoneyGenerated" FROM "WorldState";
DROP TABLE "WorldState";
ALTER TABLE "new_WorldState" RENAME TO "WorldState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
