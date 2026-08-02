"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { AD_UNLOCK_HOURS, COIN_CHAPTER_UNLOCK_COST } from "@/lib/billing";

interface UnlockResult {
  success: boolean;
  error?: string;
}

export async function unlockChapterWithAd(chapterId: string): Promise<UnlockResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { id: true } });
  if (!chapter) {
    return { success: false, error: "Chapter not found" };
  }

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
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  if (user.coinsBalance < COIN_CHAPTER_UNLOCK_COST) {
    return { success: false, error: "سکه کافی نیست" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { coinsBalance: { decrement: COIN_CHAPTER_UNLOCK_COST } },
    }),
    prisma.chapterUnlock.upsert({
      where: { userId_chapterId: { userId: user.id, chapterId } },
      update: { expiresAt: null },
      create: { userId: user.id, chapterId, expiresAt: null },
    }),
    prisma.transaction.create({
      data: {
        type: "CHAPTER_UNLOCK",
        status: "PAID",
        amount: COIN_CHAPTER_UNLOCK_COST,
        currency: "COIN",
        payerId: user.id,
      },
    }),
  ]);

  revalidatePath(`/app/read/${chapterId}`);
  return { success: true };
}