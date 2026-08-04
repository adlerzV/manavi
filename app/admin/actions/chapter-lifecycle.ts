"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";
import { notifyNewChapter } from "@/lib/telegram-bot";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function scheduleChapter(chapterId: string, scheduledAt: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const date = new Date(scheduledAt);
    if (date <= new Date()) {
      return { success: false, error: "زمان زمان‌بندی باید در آینده باشد" };
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, publishedAt: true, comic: { select: { id: true } } },
    });
    if (!chapter) return { success: false, error: "چپتر یافت نشد" };
    if (chapter.publishedAt) return { success: false, error: "چپتر قبلاً منتشر شده است" };

    await assertLicenseActive(chapter.comic.id);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { status: "SCHEDULED", scheduledAt: date },
    });

    revalidatePath("/admin/comics");
    return { success: true };
  } catch (err) {
    if (err instanceof LicenseInactiveError) {
      return { success: false, error: `Cannot schedule: ${err.reason}` };
    }
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function cancelSchedule(chapterId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.chapter.update({
      where: { id: chapterId },
      data: { status: "DRAFT", scheduledAt: null },
    });
    revalidatePath("/admin/comics");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function runScheduledPublish(): Promise<ActionResult<{ published: number }>> {
  try {
    await requireAdmin();
    const due = await prisma.chapter.findMany({
      where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
      select: {
        id: true,
        chapterNumber: true,
        comic: { select: { id: true, slug: true, title: true, license: { select: { status: true } } } },
      },
    });

    let published = 0;
    for (const chapter of due) {
      if (chapter.comic.license.status !== "ACTIVE") continue;

      await prisma.chapter.update({
        where: { id: chapter.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      published += 1;

      const bookmarks = await prisma.bookmark.findMany({
        where: { comicId: chapter.comic.id, notifyOnNewChapter: true },
        select: { user: { select: { telegramId: true } } },
      });
      if (bookmarks.length > 0) {
        notifyNewChapter({
          telegramIds: bookmarks.map((b) => b.user.telegramId),
          comicTitle: chapter.comic.title,
          comicSlug: chapter.comic.slug,
          chapterNumber: chapter.chapterNumber,
          chapterId: chapter.id,
        }).catch(() => {});
      }
    }

    revalidatePath("/app");
    revalidatePath("/app/explore");
    return { success: true, data: { published } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function reorderChapterPages(chapterId: string, orderedPages: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.chapter.update({ where: { id: chapterId }, data: { pages: orderedPages } });
    revalidatePath("/admin/comics");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}