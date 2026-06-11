-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Player" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "ducks" INTEGER NOT NULL DEFAULT 0,
    "money" REAL NOT NULL DEFAULT 150.0,
    "lastActive" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Player" ("active", "createdAt", "ducks", "id", "lastActive", "money", "name", "token", "updatedAt") SELECT "active", "createdAt", "ducks", "id", "lastActive", "money", "name", "token", "updatedAt" FROM "Player";
DROP TABLE "Player";
ALTER TABLE "new_Player" RENAME TO "Player";
CREATE UNIQUE INDEX "Player_name_key" ON "Player"("name");
CREATE UNIQUE INDEX "Player_token_key" ON "Player"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
