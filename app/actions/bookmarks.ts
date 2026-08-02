"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function toggleBookmark(comicId: string, comicSlug: string): Promise<{ bookmarked: boolean }> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_comicId: { userId: user.id, comicId } },
  });

  if (existing) {
    await prisma.bookmark.delete({
      where: { userId_comicId: { userId: user.id, comicId } },
    });
    revalidatePath(`/app/comic/${comicSlug}`);
    return { bookmarked: false };
  }

  await prisma.bookmark.create({
    data: { userId: user.id, comicId },
  });
  revalidatePath(`/app/comic/${comicSlug}`);
  return { bookmarked: true };
}