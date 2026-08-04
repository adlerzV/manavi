"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUploadAccess } from "@/lib/auth";
import { uploadChapterThumbnail } from "@/lib/s3";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function saveChapterThumbnail(formData: FormData): Promise<ActionResult> {
  try {
    const chapterId = formData.get("chapterId");
    const file = formData.get("thumbnail") as File | null;

    if (typeof chapterId !== "string" || !chapterId) {
      return { success: false, error: "chapterId is required" };
    }
    if (!file) {
      return { success: false, error: "فایل تصویر یافت نشد" };
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { chapterNumber: true, comicId: true },
    });
    if (!chapter) return { success: false, error: "چپتر یافت نشد" };

    await requireUploadAccess(chapter.comicId);

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = await uploadChapterThumbnail(chapter.comicId, chapter.chapterNumber, buffer, file.type);

    await prisma.chapter.update({ where: { id: chapterId }, data: { thumbnailImage: key } });

    revalidatePath("/admin/comics");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}