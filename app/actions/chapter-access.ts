"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { AD_UNLOCK_HOURS, COIN_CHAPTER_UNLOCK_COST } from "@/lib/billing";

interface UnlockResult {
  success: boolean;
  error?: string;
}

class InsufficientCoinsError extends Error {}

export async function unlockChapterWithAd(chapterId: string): Promise<UnlockResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { id: true } });
  if (!chapter) return { success: false, error: "Chapter not found" };

  const expiresAt = new Date(Date.now() + AD_UNLOCK_HOURS * 60 * 60 * 1000);

  await prisma.chapterUnlock.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    update: { expiresAt },
    create: { userId: user.id, chapterId, expiresAt },
  });

  revalidatePath(`/app/read/${chapterId}`);
  return { success: true };
}

export async function unlockChapterWithCoins(chapterId: string): Promise<UnlockResult> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { id: true, comicId: true } });
  if (!chapter) return { success: false, error: "Chapter not found" };

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.chapterUnlock.findUnique({ where: { userId_chapterId: { userId: user.id, chapterId } } });
      if (existing && existing.expiresAt === null) return;

      const debited = await tx.user.updateMany({
        where: { id: user.id, coinsBalance: { gte: COIN_CHAPTER_UNLOCK_COST } },
        data: { coinsBalance: { decrement: COIN_CHAPTER_UNLOCK_COST } },
      });
      if (debited.count === 0) throw new InsufficientCoinsError();

      await tx.chapterUnlock.upsert({
        where: { userId_chapterId: { userId: user.id, chapterId } },
        update: { expiresAt: null },
        create: { userId: user.id, chapterId, expiresAt: null },
      });

      await tx.transaction.create({
        data: { type: "CHAPTER_UNLOCK", status: "PAID", amount: COIN_CHAPTER_UNLOCK_COST, currency: "COIN", payerId: user.id, comicId: chapter.comicId },
      });
    });
  } catch (err) {
    if (err instanceof InsufficientCoinsError) {
      return { success: false, error: "سکه کافی نیست" };
    }
    throw err;
  }

  revalidatePath(`/app/read/${chapterId}`);
  return { success: true };
}