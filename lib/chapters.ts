import "server-only";

import { prisma } from "./prisma";
import { ChapterAccessType } from "@prisma/client";
import type { ChapterAccessInfo } from "./chapter-access";
import { redis } from "./redis";

export type { ChapterAccessInfo };

const SUBSCRIPTION_CACHE_TTL_SECONDS = 60;
const COIN_UNLOCK_CACHE_TTL_SECONDS = 300;

const subscriptionCacheKey = (userId: string) => `has-sub:${userId}`;
const coinUnlockCacheKey = (userId: string, chapterId: string) => `chapter-unlock:${userId}:${chapterId}`;

async function hasActiveSubscriptionCached(userId: string): Promise<boolean> {
  const key = subscriptionCacheKey(userId);
  try {
    const cached = await redis.get<boolean>(key);
    if (cached !== null) return cached;
  } catch {}

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { subscriptionEnd: true } });
  const active = Boolean(user?.subscriptionEnd && user.subscriptionEnd > new Date());
  redis.set(key, active, { ex: SUBSCRIPTION_CACHE_TTL_SECONDS }).catch(() => {});
  return active;
}

async function hasCoinUnlockCached(userId: string, chapterId: string): Promise<boolean> {
  const key = coinUnlockCacheKey(userId, chapterId);
  try {
    const cached = await redis.get<boolean>(key);
    if (cached !== null) return cached;
  } catch {}

  const unlock = await prisma.chapterUnlock.findUnique({ where: { userId_chapterId: { userId, chapterId } } });
  const hasUnlock = Boolean(unlock && (!unlock.expiresAt || unlock.expiresAt > new Date()));
  redis.set(key, hasUnlock, { ex: COIN_UNLOCK_CACHE_TTL_SECONDS }).catch(() => {});
  return hasUnlock;
}

export async function invalidateSubscriptionCache(userId: string): Promise<void> {
  await redis.del(subscriptionCacheKey(userId)).catch(() => {});
}

export async function invalidateChapterUnlockCache(userId: string, chapterId: string): Promise<void> {
  await redis.del(coinUnlockCacheKey(userId, chapterId)).catch(() => {});
}

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

  if (chapter.accessType === ChapterAccessType.SUBSCRIPTION) {
    return hasActiveSubscriptionCached(userId);
  }

  if (chapter.accessType === ChapterAccessType.COIN) {
    return hasCoinUnlockCached(userId, chapterId);
  }

  const hasActiveSubscription = await hasActiveSubscriptionCached(userId);
  const hasCoinUnlock = await hasCoinUnlockCached(userId, chapterId);
  return hasActiveSubscription || hasCoinUnlock;
}