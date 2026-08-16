"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser, invalidateSessionUserCache } from "@/lib/auth";
import { invalidateChapterUnlockCache } from "@/lib/chapters";
import { getChapterUnlockCoinCost } from "@/lib/platform-settings";
import { ChapterAccessType } from "@prisma/client";

interface UnlockResult {
  success: boolean;
  error?: string;
}

class InsufficientCoinsError extends Error {}

export async function unlockChapterWithCoins(chapterId: string): Promise<UnlockResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (user.isBanned) return { success: false, error: "حساب شما مسدود شده است" };

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, comicId: true, accessType: true },
  });
  if (!chapter) return { success: false, error: "Chapter not found" };
  if (chapter.accessType !== ChapterAccessType.COIN) {
    return { success: false, error: "این چپتر با سکه قابل باز شدن نیست" };
  }

  const cost = await getChapterUnlockCoinCost();

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.chapterUnlock.findUnique({ where: { userId_chapterId: { userId: user.id, chapterId } } });
      if (existing && existing.expiresAt === null) return;

      const debited = await tx.user.updateMany({
        where: { id: user.id, coinsBalance: { gte: cost } },
        data: { coinsBalance: { decrement: cost } },
      });
      if (debited.count === 0) throw new InsufficientCoinsError();

      await tx.chapterUnlock.upsert({
        where: { userId_chapterId: { userId: user.id, chapterId } },
        update: { expiresAt: null },
        create: { userId: user.id, chapterId, expiresAt: null },
      });

      await tx.transaction.create({
        data: { type: "CHAPTER_UNLOCK", status: "PAID", amount: cost, currency: "COIN", payerId: user.id, comicId: chapter.comicId },
      });
    });
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return { success: false, error: "سکه کافی نیست" };
    }
    throw err;
  }

  await Promise.all([
    invalidateSessionUserCache(user.id),
    invalidateChapterUnlockCache(user.id, chapterId),
  ]);

  revalidatePath(`/app/read/${chapterId}`);
  return { success: true };
}

export async function unlockComicWithCoins(comicId: string): Promise<UnlockResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (user.isBanned) return { success: false, error: "حساب شما مسدود شده است" };

  const comic = await prisma.comic.findUnique({ where: { id: comicId }, select: { slug: true } });
  if (!comic) return { success: false, error: "عنوان یافت نشد" };

  const cost = await getChapterUnlockCoinCost();

  const chapters = await prisma.chapter.findMany({
    where: { comicId, status: "PUBLISHED", accessType: ChapterAccessType.COIN },
    select: { id: true },
  });
  if (chapters.length === 0) {
    return { success: false, error: "چپتر سکه‌ای برای این عنوان وجود ندارد" };
  }

  const existingUnlocks = await prisma.chapterUnlock.findMany({
    where: { userId: user.id, chapterId: { in: chapters.map((c) => c.id) }, expiresAt: null },
    select: { chapterId: true },
  });
  const alreadyUnlockedIds = new Set(existingUnlocks.map((u) => u.chapterId));
  const lockedChapterIds = chapters.map((c) => c.id).filter((id) => !alreadyUnlockedIds.has(id));

  if (lockedChapterIds.length === 0) {
    return { success: false, error: "همه چپترهای این عنوان قبلاً باز شده‌اند" };
  }

  const totalCost = lockedChapterIds.length * cost;

  try {
    await prisma.$transaction(async (tx) => {
      const debited = await tx.user.updateMany({
        where: { id: user.id, coinsBalance: { gte: totalCost } },
        data: { coinsBalance: { decrement: totalCost } },
      });
      if (debited.count === 0) throw new InsufficientCoinsError();

      await Promise.all(
        lockedChapterIds.map((chapterId) =>
          tx.chapterUnlock.upsert({
            where: { userId_chapterId: { userId: user.id, chapterId } },
            update: { expiresAt: null },
            create: { userId: user.id, chapterId, expiresAt: null },
          })
        )
      );

      await tx.transaction.create({
        data: {
          type: "CHAPTER_UNLOCK",
          status: "PAID",
          amount: totalCost,
          currency: "COIN",
          payerId: user.id,
          comicId,
          message: `باز کردن کل عنوان — ${lockedChapterIds.length} چپتر`,
        },
      });
    });
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return { success: false, error: `سکه کافی نیست — ${totalCost.toLocaleString("fa-IR")} سکه لازم است` };
    }
    throw err;
  }

  await Promise.all([
    invalidateSessionUserCache(user.id),
    ...lockedChapterIds.map((chapterId) => invalidateChapterUnlockCache(user.id, chapterId)),
  ]);

  revalidatePath(`/app/comic/${comic.slug}`);
  lockedChapterIds.forEach((chapterId) => revalidatePath(`/app/read/${chapterId}`));

  return { success: true };
}