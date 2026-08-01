"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { uploadPageImage } from "@/lib/s3";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

const MAX_PAGES = 300;
const MAX_PAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB per page
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadChapter(
  formData: FormData
): Promise<ActionResult<{ chapterId: string }>> {
  try {
    await requireAdmin();

    const comicId = formData.get("comicId");
    const chapterNumberRaw = formData.get("chapterNumber");
    const title = formData.get("title");
    const pages = formData.getAll("pages") as File[];

    if (typeof comicId !== "string" || !comicId) {
      return { success: false, error: "comicId is required" };
    }
    if (typeof chapterNumberRaw !== "string" || Number.isNaN(Number(chapterNumberRaw))) {
      return { success: false, error: "A valid chapterNumber is required" };
    }
    const chapterNumber = Number(chapterNumberRaw);

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
        return {
          success: false,
          error: `${page.name} exceeds the ${MAX_PAGE_SIZE_BYTES / 1024 / 1024}MB limit`,
        };
      }
    }

    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
      select: { license: { select: { status: true } } },
    });
    if (!comic) {
      return { success: false, error: "Comic not found" };
    }
    // This is a looser check than assertLicenseActive on purpose: uploading
    // is just staging a draft, not making it visible to readers, so a
    // PENDING license (contract signed, start date not reached yet) is
    // fine here. EXPIRED/TERMINATED is not. The strict, current-validity
    // check runs again at publish time and at read time.
    if (comic.license.status === "EXPIRED" || comic.license.status === "TERMINATED") {
      return {
        success: false,
        error: `Cannot upload — license is ${comic.license.status.toLowerCase()}`,
      };
    }

    const pageUrls: string[] = [];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const buffer = Buffer.from(await page.arrayBuffer());
      const url = await uploadPageImage(comicId, chapterNumber, i, buffer, page.type);
      pageUrls.push(url);
    }

    const chapter = await prisma.chapter.create({
      data: {
        comicId,
        chapterNumber,
        title: typeof title === "string" && title.trim() ? title.trim() : null,
        pages: pageUrls,
        // publishedAt stays null on purpose — publishing is a separate,
        // deliberate step handled by publishChapter, not a side effect of upload.
      },
    });

    revalidatePath("/admin/comics");
    return { success: true, data: { chapterId: chapter.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}