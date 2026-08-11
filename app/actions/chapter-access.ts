"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
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

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
   select: { id: true, comicId: true, accessType: true },
  });
  if (!chapter) return { success: false, error: "Chapter not found" };
  if (chapter.accessType === ChapterAccessType.SUBSCRIPTION) {
    return { success: false, error: "این چپتر فقط مخصوص مشترکین ویژه است" };
  }

  const cost = await getChapterUnlockCoinCost();;

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

  revalidatePath(`/app/read/${chapterId}`);
  return { success: true };
}