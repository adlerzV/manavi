import "server-only";
import { prisma } from "./prisma";

export async function markChapterRead(userId: string, chapterId: string, comicId: string): Promise<void> {
  await prisma.chapterReadMark.upsert({
    where: { userId_chapterId: { userId, chapterId } },
    update: { readAt: new Date() },
    create: { userId, chapterId, comicId },
  });
}

export async function getReadChapterIds(userId: string, comicId: string): Promise<Set<string>> {
  const rows = await prisma.chapterReadMark.findMany({
    where: { userId, comicId },
    select: { chapterId: true },
  });
  return new Set(rows.map((r) => r.chapterId));
}

export async function hasReadAnyChapter(userId: string, comicId: string): Promise<boolean> {
  const row = await prisma.chapterReadMark.findFirst({ where: { userId, comicId }, select: { chapterId: true } });
  return Boolean(row);
}