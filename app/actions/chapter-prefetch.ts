"use server";

import { prisma } from "@/lib/prisma";
import { getSignedImageUrls } from "@/lib/s3";

const PREFETCH_PAGE_COUNT = 3;

export async function getChapterPrefetchUrls(chapterId: string): Promise<string[]> {
  const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { pages: true } });
  if (!chapter || chapter.pages.length === 0) return [];
  return getSignedImageUrls(chapter.pages.slice(0, PREFETCH_PAGE_COUNT));
}