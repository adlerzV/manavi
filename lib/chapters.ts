"use server";

import { prisma } from "./prisma";
import { ChapterAccessType } from "@prisma/client";
import { COIN_CHAPTER_UNLOCK_COST } from "./billing";
import type { ChapterAccessInfo } from "./chapter-access";

export type { ChapterAccessInfo };
export const RECENT_LOCK_COUNT = 10;

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
      coinCost: true,
    },
  });

  return chapters.map((chapter, index) => {
    const recentlyLocked = index < RECENT_LOCK_COUNT;
    const isFree = chapter.accessType === ChapterAccessType.FREE;
    const locked = !isFree && (chapter.isLocked || recentlyLocked);
    return {
      id: chapter.id,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      publishedAt: chapter.publishedAt,
      manuallyLocked: chapter.isLocked,
      recentlyLocked,
      locked,
      accessType: chapter.accessType,
      coinCost: chapter.coinCost ?? COIN_CHAPTER_UNLOCK_COST,
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionEnd: true },
  });

  const now = new Date();
  const hasActiveSubscription = Boolean(user?.subscriptionEnd && user.subscriptionEnd > now);

  if (chapter.accessType === ChapterAccessType.SUBSCRIPTION) {
    return hasActiveSubscription;
  }

  const unlock = await prisma.chapterUnlock.findUnique({
    where: { userId_chapterId: { userId, chapterId } },
  });
  const hasCoinOrAdUnlock = Boolean(unlock && (!unlock.expiresAt || unlock.expiresAt > now));

  if (chapter.accessType === ChapterAccessType.COIN) {
    return hasCoinOrAdUnlock;
  }

  return hasActiveSubscription || hasCoinOrAdUnlock;
}