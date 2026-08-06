"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUploadAccess } from "@/lib/auth";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";
import { notifyNewChapter } from "@/lib/telegram-bot";
import { deleteObject } from "@/lib/s3";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function scheduleChapter(chapterId: string, scheduledAt: string): Promise<ActionResult> {
  try {
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

    await requireUploadAccess(chapter.comic.id);
    await assertLicenseActive(chapter.comic.id);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { status: "SCHEDULED", scheduledAt: date },
    });

    revalidatePath("/admin/comics");
    revalidatePath("/publisher/comics");
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
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { comicId: true } });
    if (!chapter) return { success: false, error: "چپتر یافت نشد" };

    await requireUploadAccess(chapter.comicId);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { status: "DRAFT", scheduledAt: null },
    });
    revalidatePath("/admin/comics");
    revalidatePath("/publisher/comics");
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

    const eligible = due.filter((chapter) => chapter.comic.license.status === "ACTIVE");
    if (eligible.length === 0) {
      return { success: true, data: { published: 0 } };
    }

    const publishedChapters: typeof eligible = [];
    for (const chapter of eligible) {
      const updated = await prisma.chapter.updateMany({
        where: { id: chapter.id, publishedAt: null },
        data: { status: "PUBLISHED", publishedAt: new Date(), scheduledAt: null },
      });
      if (updated.count > 0) publishedChapters.push(chapter);
    }

    if (publishedChapters.length > 0) {
      const comicIds = [...new Set(publishedChapters.map((c) => c.comic.id))];
      const bookmarks = await prisma.bookmark.findMany({
        where: { comicId: { in: comicIds }, notifyOnNewChapter: true },
        select: { comicId: true, user: { select: { telegramId: true } } },
      });

      const telegramIdsByComicId = new Map<string, bigint[]>();
      for (const b of bookmarks) {
        const list = telegramIdsByComicId.get(b.comicId) ?? [];
        list.push(b.user.telegramId);
        telegramIdsByComicId.set(b.comicId, list);
      }

      for (const chapter of publishedChapters) {
        const telegramIds = telegramIdsByComicId.get(chapter.comic.id);
        if (!telegramIds?.length) continue;
        after(() =>
          notifyNewChapter({
            telegramIds,
            comicTitle: chapter.comic.title,
            comicSlug: chapter.comic.slug,
            chapterNumber: chapter.chapterNumber,
            chapterId: chapter.id,
          }).catch(() => {})
        );
      }
    }

    revalidatePath("/app");
    revalidatePath("/app/explore");
    return { success: true, data: { published: publishedChapters.length } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function reorderChapterPages(chapterId: string, orderedPages: string[]): Promise<ActionResult> {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { comicId: true } });
    if (!chapter) return { success: false, error: "چپتر یافت نشد" };

    await requireUploadAccess(chapter.comicId);

    await prisma.chapter.update({ where: { id: chapterId }, data: { pages: orderedPages } });
    revalidatePath("/admin/comics");
    revalidatePath("/publisher/comics");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteChapter(chapterId: string): Promise<ActionResult> {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { pages: true, thumbnailImage: true, comicId: true, comic: { select: { slug: true } } },
    });
    if (!chapter) return { success: false, error: "چپتر یافت نشد" };

    await requireUploadAccess(chapter.comicId);

    await prisma.$transaction([
      prisma.chapterReaction.deleteMany({ where: { chapterId } }),
      prisma.chapterUnlock.deleteMany({ where: { chapterId } }),
      prisma.chapterStaff.deleteMany({ where: { chapterId } }),
      prisma.comment.deleteMany({ where: { chapterId } }),
      prisma.chapter.delete({ where: { id: chapterId } }),
    ]);

    const keysToDelete = [...chapter.pages, chapter.thumbnailImage].filter(
      (key): key is string => Boolean(key) && !key.startsWith("http://") && !key.startsWith("https://")
    );
    await Promise.all(keysToDelete.map((key) => deleteObject(key).catch(() => {})));

    revalidatePath("/admin/comics");
    revalidatePath(`/admin/comics/${chapter.comicId}`);
    revalidatePath("/publisher/comics");
    revalidatePath(`/publisher/comics/${chapter.comicId}`);
    revalidatePath(`/app/comic/${chapter.comic.slug}`);
    revalidatePath("/app");
    revalidatePath("/app/explore");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}