-- CreateEnum
CREATE TYPE "ChapterAccessType" AS ENUM ('FREE', 'COIN', 'SUBSCRIPTION', 'COIN_OR_SUBSCRIPTION');

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "accessType" "ChapterAccessType" NOT NULL DEFAULT 'COIN_OR_SUBSCRIPTION',
ADD COLUMN     "coinCost" INTEGER;