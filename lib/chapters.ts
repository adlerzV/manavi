import { prisma } from "./prisma";

export const RECENT_LOCK_COUNT = 10;

export interface ChapterAccessInfo {
  id: string;
  chapterNumber: number;
  title: string | null;
  publishedAt: Date | null;
  manuallyLocked: boolean;
  recentlyLocked: boolean;
  locked: boolean;
}

export async function getChapterAccessList(comicId: string): Promise<ChapterAccessInfo[]> {
  const chapters = await prisma.chapter.findMany({
    where: { comicId, publishedAt: { not: null } },
    orderBy: { chapterNumber: "desc" },
    select: { id: true, chapterNumber: true, title: true, publishedAt: true, isLocked: true },
  });

  return chapters.map((chapter, index) => {
    const recentlyLocked = index < RECENT_LOCK_COUNT;
    return {
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      publishedAt: chapter.publishedAt,
      manuallyLocked: chapter.isLocked,
      recentlyLocked,
      locked: chapter.isLocked || recentlyLocked,
    };
  });
}

export async function userHasChapterAccess(userId: string | null, chapterId: string): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionEnd: true },
  });

  const now = new Date();
  if (user?.subscriptionEnd && user.subscriptionEnd > now) {
    return true;
  }

  const unlock = await prisma.chapterUnlock.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });

  if (!unlock) return false;
  if (!unlock.expiresAt) return true;
  return unlock.expiresAt > now;
}