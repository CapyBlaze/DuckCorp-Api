/*
  Warnings:

  - The primary key for the `WorldState` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `WorldState` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorldState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "totalDucksProduced" BIGINT NOT NULL DEFAULT 0,
    "totalDucksSold" BIGINT NOT NULL DEFAULT 0,
    "totalMoneyGenerated" BIGINT NOT NULL DEFAULT 0,
    "marketPrice" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" DATETIME NOT NULL
);
INSERT INTO "new_WorldState" ("id", "lastUpdate", "marketPrice", "totalDucksProduced", "totalDucksSold", "totalMoneyGenerated") SELECT "id", "lastUpdate", "marketPrice", "totalDucksProduced", "totalDucksSold", "totalMoneyGenerated" FROM "WorldState";
DROP TABLE "WorldState";
ALTER TABLE "new_WorldState" RENAME TO "WorldState";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
