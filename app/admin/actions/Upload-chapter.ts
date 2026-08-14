"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUploadAccess } from "@/lib/auth";
import { uploadPageImage } from "@/lib/s3";
import { processInBatches } from "@/lib/batch-upload";
import { describeUploadError } from "@/lib/upload-error";
import { ChapterAccessType } from "@prisma/client";
import { ingestChapter } from "@/lib/chapter-ingest";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

const MAX_PAGES = 300;
const MAX_PAGE_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadChapter(formData: FormData): Promise<ActionResult<{ chapterId: string }>> {
  try {
    const comicId = formData.get("comicId");
    const chapterNumberRaw = formData.get("chapterNumber");
    const title = formData.get("title");
    const accessTypeRaw = formData.get("accessType");
    const pages = formData.getAll("pages") as File[];

    if (typeof comicId !== "string" || !comicId) {
      return { success: false, error: "comicId is required" };
    }

    await requireUploadAccess(comicId);

    if (typeof chapterNumberRaw !== "string" || Number.isNaN(Number(chapterNumberRaw))) {
      return { success: false, error: "A valid chapterNumber is required" };
    }
    const chapterNumber = Number(chapterNumberRaw);

    const accessType: ChapterAccessType =
      typeof accessTypeRaw === "string" && accessTypeRaw in ChapterAccessType
        ? (accessTypeRaw as ChapterAccessType)
        : ChapterAccessType.FREE;

    if (pages.length === 0) {
      return { success: false, error: "At least one page is required" };
    }
    if (pages.length > MAX_PAGES) {
      return { success: false, error: `A chapter cannot exceed ${MAX_PAGES} pages` };
    }
    for (const page of pages) {
      if (!ALLOWED_TYPES.has(page.type)) {
        return { success: false, error: `Unsupported file type: ${page.type}` };
      }
      if (page.size > MAX_PAGE_SIZE_BYTES) {
        return { success: false, error: `${page.name} exceeds the ${MAX_PAGE_SIZE_BYTES / 1024 / 1024}MB limit` };
      }
    }

    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
      select: { license: { select: { status: true } } },
    });
    if (!comic) {
      return { success: false, error: "Comic not found" };
    }
    if (comic.license.status === "EXPIRED" || comic.license.status === "TERMINATED") {
      return { success: false, error: `Cannot upload — license is ${comic.license.status.toLowerCase()}` };
    }

    const pageUrls = await processInBatches(pages, 5, async (page, i) => {
      const buffer = Buffer.from(await page.arrayBuffer());
      return await uploadPageImage(comicId, chapterNumber, i, buffer, page.type);
    });

    const result = await ingestChapter({
      comicId,
      chapterNumber,
      title: typeof title === "string" ? title : null,
      accessType,
      pageKeys: pageUrls,
    });

    if (!result.success) return result;

    revalidatePath("/admin/comics");
    revalidatePath("/publisher/comics");
    return { success: true, data: { chapterId: result.chapterId! } };
  } catch (err) {
    return { success: false, error: describeUploadError(err) };
  }
}