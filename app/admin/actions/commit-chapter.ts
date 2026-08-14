"use server";

import { revalidatePath } from "next/cache";
import { requireUploadAccess } from "@/lib/auth";
import { ingestChapter, MAX_CHAPTER_PAGES } from "@/lib/chapter-ingest";
import { safeError } from "@/lib/errors";
import type { ChapterAccessType } from "@prisma/client";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function commitUploadedChapter(input: {
  comicId: string;
  chapterNumber: number;
  title?: string;
  accessType: ChapterAccessType;
  pageKeys: string[];
}): Promise<ActionResult<{ chapterId: string }>> {
  try {
    if (!input.comicId) return { success: false, error: "comicId الزامی است" };
    if (input.pageKeys.length === 0) return { success: false, error: "حداقل یک صفحه لازم است" };
    if (input.pageKeys.length > MAX_CHAPTER_PAGES) {
      return { success: false, error: `چپتر نمی‌تواند بیش از ${MAX_CHAPTER_PAGES} صفحه داشته باشد` };
    }

    await requireUploadAccess(input.comicId);

    const result = await ingestChapter({
      comicId: input.comicId,
      chapterNumber: input.chapterNumber,
      title: input.title ?? null,
      accessType: input.accessType,
      pageKeys: input.pageKeys,
    });

    if (!result.success) return result;

    revalidatePath("/admin/comics");
    revalidatePath("/publisher/comics");
    return { success: true, data: { chapterId: result.chapterId! } };
  } catch (err) {
    return safeError(err);
  }
}