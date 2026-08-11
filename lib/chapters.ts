import "server-only";

import { prisma } from "./prisma";
import { ChapterAccessType } from "@prisma/client";
import type { ChapterAccessInfo } from "./chapter-access";

export type { ChapterAccessInfo };

export async function getChapterAccessList(comicId: string): Promise<ChapterAccessInfo[]> {
  const chapters = await prisma.chapter.findMany({
    where: { comicId, publishedAt: { not: null } },
    orderBy: { chapterNumber: "desc" },
    select: {
      id: true,
      chapterNumber: true,
      title: true,
      publishedAt: true,
      isLocked: true,
      accessType: true,
    },
  });

  return chapters.map((chapter) => {
    const isFree = chapter.accessType === ChapterAccessType.FREE;
    const locked = !isFree && chapter.isLocked;
    return {
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      publishedAt: chapter.publishedAt,
      manuallyLocked: chapter.isLocked,
      locked,
      accessType: chapter.accessType,
    };
  });
}

export async function userHasChapterAccess(
  userId: string | null,
  chapterId: string,
  role?: string
): Promise<boolean> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { accessType: true },
  });
  if (!chapter) return false;
  if (chapter.accessType === ChapterAccessType.FREE) return true;

  if (!userId) return false;
  if (role === "ADMIN") return true;

  const now = new Date();

  if (chapter.accessType === ChapterAccessType.SUBSCRIPTION) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionEnd: true } });
    return Boolean(user?.subscriptionEnd && user.subscriptionEnd > now);
  }

  const unlock = await prisma.chapterUnlock.findUnique({ where: { userId_chapterId: { userId, chapterId } } });
  const hasCoinUnlock = Boolean(unlock && (!unlock.expiresAt || unlock.expiresAt > now));

  if (chapter.accessType === ChapterAccessType.COIN) {
    return hasCoinUnlock;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionEnd: true } });
  const hasActiveSubscription = Boolean(user?.subscriptionEnd && user.subscriptionEnd > now);
  return hasActiveSubscription || hasCoinUnlock;
}