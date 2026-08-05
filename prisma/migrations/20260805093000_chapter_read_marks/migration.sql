ALTER TABLE "Chapter" ALTER COLUMN "accessType" SET DEFAULT 'FREE';

CREATE TABLE "ChapterReadMark" (
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "comicId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterReadMark_pkey" PRIMARY KEY ("userId","chapterId")
);

CREATE INDEX "ChapterReadMark_userId_comicId_idx" ON "ChapterReadMark"("userId", "comicId");

ALTER TABLE "ChapterReadMark" ADD CONSTRAINT "ChapterReadMark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChapterReadMark" ADD CONSTRAINT "ChapterReadMark_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChapterReadMark" ADD CONSTRAINT "ChapterReadMark_comicId_fkey" FOREIGN KEY ("comicId") REFERENCES "Comic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;