ALTER TABLE "User" DROP COLUMN "currentStreak";
ALTER TABLE "User" DROP COLUMN "longestStreak";
ALTER TABLE "User" DROP COLUMN "lastCheckinAt";
ALTER TABLE "User" ADD COLUMN "referralRewardGranted" BOOLEAN NOT NULL DEFAULT false;