/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `referralCode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MANHWA', 'MANGA', 'COMIC', 'WEBTOON');

-- CreateEnum
CREATE TYPE "ReadingMode" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- AlterTable
ALTER TABLE "Comic" ADD COLUMN     "contentType" "ContentType" NOT NULL DEFAULT 'MANHWA',
ADD COLUMN     "readingMode" "ReadingMode" NOT NULL DEFAULT 'VERTICAL';

-- AlterTable
ALTER TABLE "ReadHistory" ADD COLUMN     "scrollFraction" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCheckinAt" TIMESTAMP(3),
ADD COLUMN     "longestStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralCode" TEXT NOT NULL,
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referredById" TEXT;

-- CreateTable
CREATE TABLE "ChapterReaction" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChapterReaction_chapterId_idx" ON "ChapterReaction"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterReaction_chapterId_userId_key" ON "ChapterReaction"("chapterId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referredById_idx" ON "User"("referredById");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterReaction" ADD CONSTRAINT "ChapterReaction_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterReaction" ADD CONSTRAINT "ChapterReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
