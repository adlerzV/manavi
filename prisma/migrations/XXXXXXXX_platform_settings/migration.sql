CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "chapterUnlockCoinCost" INTEGER NOT NULL DEFAULT 15,
    "newReleaseThresholdHours" INTEGER NOT NULL DEFAULT 72,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);
INSERT INTO "PlatformSettings" ("id", "updatedAt") VALUES ('singleton', CURRENT_TIMESTAMP);

ALTER TABLE "Chapter" DROP COLUMN "coinCost";