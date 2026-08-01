"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/session";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";

interface PublishChapterResult {
  success: boolean;
  error?: string;
}

/**
 * ADMIN can publish anything. A PUBLISHER user can only publish chapters
 * for comics whose license belongs to their own Publisher record — a
 * publisher account should never be able to publish someone else's title.
 */
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

  if (user.role === "PUBLISHER" && user.publisherProfile) {
    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
      select: { license: { select: { publisherId: true } } },
    });
    if (comic?.license.publisherId === user.publisherProfile.id) {
      return;
    }
  }

  throw new Error("Not authorized to publish this chapter");
}

export async function publishChapter(chapterId: string): Promise<PublishChapterResult> {
  try {
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      select: {
        id: true,
        publishedAt: true,
        comic: { select: { id: true, slug: true } },
      },
    });

    if (!chapter) {
      return { success: false, error: "Chapter not found" };
    }
    if (chapter.publishedAt) {
      return { success: false, error: "Chapter is already published" };
    }

    await requirePublishAccess(chapter.comic.id);

    // Re-check right now — status/dates may have changed since the chapter
    // was uploaded, so never trust a check done earlier in the flow.
    await assertLicenseActive(chapter.comic.id);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { publishedAt: new Date() },
    });

    // On-demand ISR revalidation, per the caching requirement from step 1 —
    // no polling, the public pages just get invalidated on actual change.
    revalidatePath(`/comic/${chapter.comic.slug}`);
    revalidatePath(`/read/${chapterId}`);

    return { success: true };
  } catch (err) {
    if (err instanceof LicenseInactiveError) {
      return { success: false, error: `Cannot publish: ${err.reason}` };
    }
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
