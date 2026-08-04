-- AlterEnum
ALTER TYPE "ReadingMode" ADD VALUE 'DOUBLE_PAGE';

-- AlterTable
ALTER TABLE "Comic" ADD COLUMN     "featuredBadge" TEXT,
ADD COLUMN     "isFeaturedOnHome" BOOLEAN NOT NULL DEFAULT false;
