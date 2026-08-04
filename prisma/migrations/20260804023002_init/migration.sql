-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'LOCALIZATION_TEAM', 'PUBLISHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "AgeRating" AS ENUM ('NORMAL', 'EIGHTEEN_PLUS', 'NSFW');

-- CreateEnum
CREATE TYPE "ComicStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('LOCALIZATION_SPECIALIST', 'EDITOR', 'CLEANER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION', 'DONATION', 'COIN_PURCHASE', 'CHAPTER_UNLOCK');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PAID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "CreatorApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionEnd" TIMESTAMP(3),
    "coinsBalance" INTEGER NOT NULL DEFAULT 0,
    "contentPreference" "AgeRating" NOT NULL DEFAULT 'NORMAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publisher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "legalEntity" TEXT,
    "contactEmail" TEXT NOT NULL,
    "contractUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publisher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "publisherId" TEXT NOT NULL,
    "territory" TEXT[],
    "royaltyPercentage" DECIMAL(5,2) NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "contractReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "bannerImage" TEXT,
    "dominantColor" TEXT,
    "ageRating" "AgeRating" NOT NULL DEFAULT 'NORMAL',
    "status" "ComicStatus" NOT NULL DEFAULT 'ONGOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "licenseId" TEXT NOT NULL,

    CONSTRAINT "Comic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComicGenre" (
    "comicId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "ComicGenre_pkey" PRIMARY KEY ("comicId","genreId")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComicTag" (
    "comicId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ComicTag_pkey" PRIMARY KEY ("comicId","tagId")
);

-- CreateTable
CREATE TABLE "ComicStaff" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleTitle" "StaffRole" NOT NULL,

    CONSTRAINT "ComicStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "chapterNumber" DOUBLE PRECISION NOT NULL,
    "title" TEXT,
    "pages" TEXT[],
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterStaff" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleTitle" "StaffRole" NOT NULL,

    CONSTRAINT "ChapterStaff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterUnlock" (
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "ChapterUnlock_pkey" PRIMARY KEY ("userId","chapterId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isSpoiler" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "userId" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("userId","comicId")
);

-- CreateTable
CREATE TABLE "ReadHistory" (
    "userId" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "lastChapterId" TEXT NOT NULL,
    "lastPage" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadHistory_pkey" PRIMARY KEY ("userId","comicId")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IRT',
    "payerId" TEXT NOT NULL,
    "receiverId" TEXT,
    "message" TEXT,
    "comicId" TEXT,
    "gatewayAuthority" TEXT,
    "gatewayRefId" TEXT,
    "settlementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoyaltySettlement" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "grossRevenue" DECIMAL(12,2) NOT NULL,
    "publisherShare" DECIMAL(12,2) NOT NULL,
    "localizationTeamShare" DECIMAL(12,2) NOT NULL,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoyaltySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "portfolioUrl" TEXT,
    "message" TEXT NOT NULL,
    "status" "CreatorApplicationStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Publisher_contractUserId_key" ON "Publisher"("contractUserId");

-- CreateIndex
CREATE INDEX "License_publisherId_idx" ON "License"("publisherId");

-- CreateIndex
CREATE INDEX "License_status_idx" ON "License"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Comic_slug_key" ON "Comic"("slug");

-- CreateIndex
CREATE INDEX "Comic_licenseId_idx" ON "Comic"("licenseId");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_slug_key" ON "Genre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ComicStaff_comicId_userId_roleTitle_key" ON "ComicStaff"("comicId", "userId", "roleTitle");

-- CreateIndex
CREATE INDEX "Chapter_comicId_chapterNumber_idx" ON "Chapter"("comicId", "chapterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterStaff_chapterId_userId_roleTitle_key" ON "ChapterStaff"("chapterId", "userId", "roleTitle");

-- CreateIndex
CREATE INDEX "Comment_chapterId_createdAt_idx" ON "Comment"("chapterId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_gatewayAuthority_key" ON "Transaction"("gatewayAuthority");

-- CreateIndex
CREATE INDEX "Transaction_comicId_idx" ON "Transaction"("comicId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_settlementId_idx" ON "Transaction"("settlementId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_receiverId_idx" ON "Transaction"("receiverId");

-- CreateIndex
CREATE INDEX "RoyaltySettlement_licenseId_periodStart_idx" ON "RoyaltySettlement"("licenseId", "periodStart");

-- AddForeignKey
ALTER TABLE "Publisher" ADD CONSTRAINT "Publisher_contractUserId_fkey" FOREIGN KEY ("contractUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Publisher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comic" ADD CONSTRAINT "Comic_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicGenre" ADD CONSTRAINT "ComicGenre_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicGenre" ADD CONSTRAINT "ComicGenre_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicTag" ADD CONSTRAINT "ComicTag_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicTag" ADD CONSTRAINT "ComicTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicStaff" ADD CONSTRAINT "ComicStaff_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComicStaff" ADD CONSTRAINT "ComicStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterStaff" ADD CONSTRAINT "ChapterStaff_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterStaff" ADD CONSTRAINT "ChapterStaff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterUnlock" ADD CONSTRAINT "ChapterUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterUnlock" ADD CONSTRAINT "ChapterUnlock_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadHistory" ADD CONSTRAINT "ReadHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadHistory" ADD CONSTRAINT "ReadHistory_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "RoyaltySettlement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoyaltySettlement" ADD CONSTRAINT "RoyaltySettlement_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
