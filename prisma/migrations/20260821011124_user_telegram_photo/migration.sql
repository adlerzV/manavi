-- DropIndex
DROP INDEX "Comic_title_trgm_idx";

-- CreateIndex
CREATE INDEX "Chapter_comicId_publishedAt_idx" ON "Chapter"("comicId", "publishedAt");

-- CreateIndex
CREATE INDEX "Comic_createdAt_idx" ON "Comic"("createdAt");

-- CreateIndex
CREATE INDEX "Comment_chapterId_status_idx" ON "Comment"("chapterId", "status");
