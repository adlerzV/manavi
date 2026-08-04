import { prisma } from "./prisma";

export async function recordChapterView(chapterId: string, comicId: string): Promise<void> {
  await prisma.$transaction([
    prisma.chapter.update({ where: { id: chapterId }, data: { viewCount: { increment: 1 } } }),
    prisma.comic.update({ where: { id: comicId }, data: { viewCount: { increment: 1 } } }),
  ]);
}