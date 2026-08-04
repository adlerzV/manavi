"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function updateReadHistory(
  comicId: string,
  chapterId: string,
  page: number,
  scrollFraction: number
): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  const clampedFraction = Math.min(1, Math.max(0, scrollFraction));

  await prisma.readHistory.upsert({
    where: { userId_comicId: { userId: user.id, comicId } },
    update: { lastChapterId: chapterId, lastPage: page, scrollFraction: clampedFraction },
    create: { userId: user.id, comicId, lastChapterId: chapterId, lastPage: page, scrollFraction: clampedFraction },
  });
}