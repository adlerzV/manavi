"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";
import { notifyNewChapter } from "@/lib/telegram-bot";

interface PublishChapterResult {
  success: boolean;
  error?: string;
}

async function requirePublishAccess(comicId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    throw new Error("Not authenticated");
  }

  const session = verifySessionToken(token);
  if (!session) {
    throw new Error("Invalid or expired session");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { publisherProfile: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "ADMIN") {
    return;
  }

  const comic = await prisma.comic.findUnique({
    where: { id: comicId },
    select: { license: { select: { publisherId: true } } },
  });
  if (!comic) {
    throw new Error("Comic not found");
  }

  if (user.role === "PUBLISHER" && user.publisherProfile?.id === comic.license.publisherId) {
    return;
  }

  const staffLink = await prisma.publisherStaff.findFirst({
    where: { userId: user.id, publisherId: comic.license.publisherId, canUpload: true },
  });
  if (staffLink) {
    return;
  }

  throw new Error("Not authorized to publish this chapter");
}

export async function publishChapter(chapterId: string): Promise<PublishChapterResult> {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        chapterNumber: true,
        publishedAt: true,
        comic: { select: { id: true, slug: true, title: true } },
      },
    });

    if (!chapter) {
      return { success: false, error: "Chapter not found" };
    }
    if (chapter.publishedAt) {
      return { success: false, error: "Chapter is already published" };
    }

    await requirePublishAccess(chapter.comic.id);
    await assertLicenseActive(chapter.comic.id);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { publishedAt: new Date(), status: "PUBLISHED", scheduledAt: null },
    });

    revalidatePath(`/app/comic/${chapter.comic.slug}`);
    revalidatePath(`/app/read/${chapterId}`);
    revalidatePath("/app");
    revalidatePath("/app/explore");

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
        chapterId,
      }).catch(() => {});
    }

    return { success: true };
  } catch (err) {
    if (err instanceof LicenseInactiveError) {
      return { success: false, error: `Cannot publish: ${err.reason}` };
    }
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}