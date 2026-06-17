-- CreateTable
CREATE TABLE "WorldState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalDucksProduced" BIGINT NOT NULL DEFAULT 0,
    "totalDucksSold" BIGINT NOT NULL DEFAULT 0,
    "totalMoneyGenerated" BIGINT NOT NULL DEFAULT 0,
    "marketPrice" REAL NOT NULL DEFAULT 1.0,
    "lastUpdate" DATETIME NOT NULL
);
