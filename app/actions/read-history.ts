"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function updateReadHistory(comicId: string, chapterId: string, page: number): Promise<void> {
  const user = await getSessionUser();
  if (!user) return;

  await prisma.readHistory.upsert({
    where: { userId_comicId: { userId: user.id, comicId } },
    update: { lastChapterId: chapterId, lastPage: page },
    create: { userId: user.id, comicId, lastChapterId: chapterId, lastPage: page },
  });
}