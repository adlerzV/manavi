CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateEnum
CREATE TYPE "ReadingDirection" AS ENUM ('LTR', 'RTL');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "readingDirection" "ReadingDirection" NOT NULL DEFAULT 'LTR',
    "defaultReadingMode" "ReadingMode" NOT NULL DEFAULT 'VERTICAL',
    "showOnHomepage" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE INDEX "Category_showOnHomepage_sortOrder_idx" ON "Category"("showOnHomepage", "sortOrder");
CREATE INDEX "Category_isActive_sortOrder_idx" ON "Category"("isActive", "sortOrder");

-- Seed default categories (preserves current ContentType behavior exactly)
INSERT INTO "Category" ("id", "name", "slug", "readingDirection", "defaultReadingMode", "showOnHomepage", "isActive", "sortOrder", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'مانهوا', 'manhwa', 'LTR', 'VERTICAL',   true, true, 0, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'مانگا',  'manga',  'RTL', 'HORIZONTAL', true, true, 1, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'کمیک',   'comic',  'RTL', 'HORIZONTAL', true, true, 2, CURRENT_TIMESTAMP),
  (gen_random_uuid()::text, 'وبتون',  'webtoon','LTR', 'VERTICAL',   true, true, 3, CURRENT_TIMESTAMP);

-- AlterTable: add nullable categoryId first
ALTER TABLE "Comic" ADD COLUMN "categoryId" TEXT;

-- Backfill from legacy enum
UPDATE "Comic" c
SET "categoryId" = cat."id"
FROM "Category" cat
WHERE
  (c."contentType" = 'MANHWA'  AND cat."slug" = 'manhwa') OR
  (c."contentType" = 'MANGA'   AND cat."slug" = 'manga')  OR
  (c."contentType" = 'COMIC'   AND cat."slug" = 'comic')  OR
  (c."contentType" = 'WEBTOON' AND cat."slug" = 'webtoon');

-- Safety net
UPDATE "Comic" SET "categoryId" = (SELECT "id" FROM "Category" ORDER BY "sortOrder" ASC LIMIT 1)
WHERE "categoryId" IS NULL;

-- Enforce constraints
ALTER TABLE "Comic" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Comic" ADD CONSTRAINT "Comic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
CREATE INDEX "Comic_categoryId_idx" ON "Comic"("categoryId");

-- Drop legacy
ALTER TABLE "Comic" DROP COLUMN "contentType";
DROP TYPE "ContentType";