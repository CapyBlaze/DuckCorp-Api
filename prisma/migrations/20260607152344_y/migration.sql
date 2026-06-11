/*
  Warnings:

  - The primary key for the `PlayerAchievement` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `PlayerAchievement` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlayerAchievement" (
    "achievementId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("achievementId", "playerId"),
    CONSTRAINT "PlayerAchievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlayerAchievement" ("achievementId", "playerId", "unlockedAt") SELECT "achievementId", "playerId", "unlockedAt" FROM "PlayerAchievement";
DROP TABLE "PlayerAchievement";
ALTER TABLE "new_PlayerAchievement" RENAME TO "PlayerAchievement";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
