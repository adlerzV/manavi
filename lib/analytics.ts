import "server-only";
import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";

export async function recordChapterView(chapterId: string, comicId: string): Promise<void> {
  await prisma.$transaction([
    prisma.chapter.update({ where: { id: chapterId }, data: { viewCount: { increment: 1 } } }),
    prisma.comic.update({ where: { id: comicId }, data: { viewCount: { increment: 1 } } }),
  ]);
}

export async function recordChapterVisit(chapterId: string, comicId: string, userId: string | null): Promise<void> {
  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.chapter.update({ where: { id: chapterId }, data: { viewCount: { increment: 1 } } }),
    prisma.comic.update({ where: { id: comicId }, data: { viewCount: { increment: 1 } } }),
  ];

  if (userId) {
    ops.push(
      prisma.chapterReadMark.upsert({
        where: { userId_chapterId: { userId, chapterId } },
        update: { readAt: new Date() },
        create: { userId, chapterId, comicId },
      })
    );
  }

  await prisma.$transaction(ops);
}