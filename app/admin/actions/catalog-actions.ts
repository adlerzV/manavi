"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUploadAccess } from "@/lib/auth";
import { deleteObject } from "@/lib/s3";
import { extractDominantColor } from "@/lib/color";
import { LicenseStatus, ContentType, ReadingMode, ChapterAccessType } from "@prisma/client";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function createPublisher(input: {
  name: string;
  legalEntity?: string;
  contactEmail: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.name.trim() || !input.contactEmail.trim()) {
      return { success: false, error: "Name and contact email are required" };
    }

    const publisher = await prisma.publisher.create({
      data: {
        name: input.name.trim(),
        legalEntity: input.legalEntity?.trim() || null,
        contactEmail: input.contactEmail.trim(),
      },
    });

    revalidatePath("/admin/publishers");
    return { success: true, data: { id: publisher.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createLicense(input: {
  publisherId: string;
  territory: string[];
  royaltyPercentage: number;
  startDate: string;
  endDate?: string;
  contractReference?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.publisherId) {
      return { success: false, error: "Publisher is required" };
    }
    if (input.territory.length === 0) {
      return { success: false, error: "At least one territory is required" };
    }
    if (input.royaltyPercentage < 0 || input.royaltyPercentage > 100) {
      return { success: false, error: "Royalty percentage must be between 0 and 100" };
    }

    const startDate = new Date(input.startDate);
    const endDate = input.endDate ? new Date(input.endDate) : null;
    if (endDate && endDate <= startDate) {
      return { success: false, error: "End date must be after start date" };
    }

    const license = await prisma.license.create({
      data: {
        publisherId: input.publisherId,
        territory: input.territory,
        royaltyPercentage: input.royaltyPercentage,
        startDate,
        endDate,
        contractReference: input.contractReference?.trim() || null,
        status: LicenseStatus.PENDING,
      },
    });

    revalidatePath("/admin/licenses");
    return { success: true, data: { id: license.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function activateLicense(licenseId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.license.update({
      where: { id: licenseId },
      data: { status: LicenseStatus.ACTIVE },
    });
    revalidatePath("/admin/licenses");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function terminateLicense(licenseId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.license.update({
      where: { id: licenseId },
      data: { status: LicenseStatus.TERMINATED, terminatedAt: new Date() },
    });
    revalidatePath("/admin/licenses");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function createComic(input: {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  bannerImage?: string;
  licenseId: string;
  ageRating: "NORMAL" | "EIGHTEEN_PLUS" | "NSFW";
  contentType: ContentType;
  readingMode: ReadingMode;
  genreIds?: string[];
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    if (!input.title.trim() || !input.slug.trim() || !input.licenseId) {
      return { success: false, error: "Title, slug, and license are required" };
    }

    const license = await prisma.license.findUnique({ where: { id: input.licenseId } });
    if (!license) {
      return { success: false, error: "License not found" };
    }
    if (license.status === LicenseStatus.EXPIRED || license.status === LicenseStatus.TERMINATED) {
      return {
        success: false,
        error: `Cannot attach content to a ${license.status.toLowerCase()} license`,
      };
    }

    const dominantColor = await extractDominantColor(input.coverImage);

    const comic = await prisma.comic.create({
      data: {
        title: input.title.trim(),
        slug: input.slug.trim(),
        description: input.description.trim(),
        coverImage: input.coverImage,
        bannerImage: input.bannerImage || null,
        dominantColor,
        licenseId: input.licenseId,
        ageRating: input.ageRating,
        contentType: input.contentType,
        readingMode: input.readingMode,
        genres: input.genreIds?.length
          ? { create: input.genreIds.map((genreId) => ({ genreId })) }
          : undefined,
      },
    });

    revalidatePath("/admin/comics");
    revalidatePath("/app/explore");
    revalidatePath("/app");
    return { success: true, data: { id: comic.id } };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { success: false, error: "این اسلاگ قبلاً استفاده شده — لطفاً یک اسلاگ دیگر انتخاب کنید" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateComic(
  comicId: string,
  input: {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    bannerImage?: string;
    licenseId: string;
    ageRating: "NORMAL" | "EIGHTEEN_PLUS" | "NSFW";
    contentType: ContentType;
    readingMode: ReadingMode;
    isFeaturedOnHome: boolean;
    featuredBadge?: string;
    genreIds?: string[];
  }
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!input.title.trim() || !input.slug.trim() || !input.licenseId) {
      return { success: false, error: "عنوان، اسلاگ و لایسنس الزامی است" };
    }

    const existing = await prisma.comic.findUnique({ where: { id: comicId }, select: { coverImage: true } });
    if (!existing) return { success: false, error: "عنوان یافت نشد" };

    const coverChanged = existing.coverImage !== input.coverImage;
    const dominantColor = coverChanged ? await extractDominantColor(input.coverImage) : undefined;

    const comic = await prisma.$transaction(async (tx) => {
      if (input.genreIds) {
        await tx.comicGenre.deleteMany({ where: { comicId } });
        if (input.genreIds.length > 0) {
          await tx.comicGenre.createMany({ data: input.genreIds.map((genreId) => ({ comicId, genreId })) });
        }
      }

      return tx.comic.update({
        where: { id: comicId },
        data: {
          title: input.title.trim(),
          slug: input.slug.trim(),
          description: input.description.trim(),
          coverImage: input.coverImage,
          bannerImage: input.bannerImage || null,
          ...(dominantColor !== undefined ? { dominantColor } : {}),
          licenseId: input.licenseId,
          ageRating: input.ageRating,
          contentType: input.contentType,
          readingMode: input.readingMode,
          isFeaturedOnHome: input.isFeaturedOnHome,
          featuredBadge: input.featuredBadge?.trim() || null,
        },
      });
    });

    revalidatePath("/admin/comics");
    revalidatePath(`/admin/comics/${comicId}`);
    revalidatePath(`/app/comic/${comic.slug}`);
    revalidatePath("/app");
    revalidatePath("/app/explore");
    return { success: true };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return { success: false, error: "این اسلاگ قبلاً استفاده شده — لطفاً یک اسلاگ دیگر انتخاب کنید" };
    }
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateChapter(
  chapterId: string,
  input: {
    title?: string;
    chapterNumber: number;
    isLocked: boolean;
    accessType?: ChapterAccessType;
    coinCost?: number | null;
  }
): Promise<ActionResult> {
  try {
    if (!Number.isFinite(input.chapterNumber) || input.chapterNumber <= 0) {
      return { success: false, error: "شماره چپتر نامعتبر است" };
    }
    if (input.coinCost != null && (!Number.isFinite(input.coinCost) || input.coinCost < 0)) {
      return { success: false, error: "قیمت سکه نامعتبر است" };
    }

    const existing = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { comicId: true } });
    if (!existing) return { success: false, error: "چپتر یافت نشد" };

    await requireUploadAccess(existing.comicId);

    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: input.title?.trim() || null,
        chapterNumber: input.chapterNumber,
        isLocked: input.isLocked,
        ...(input.accessType ? { accessType: input.accessType } : {}),
        coinCost: input.coinCost ?? null,
      },
      select: { comic: { select: { id: true, slug: true } } },
    });

    revalidatePath(`/admin/comics/${chapter.comic.id}`);
    revalidatePath(`/publisher/comics/${chapter.comic.id}`);
    revalidatePath(`/app/comic/${chapter.comic.slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function removeChapterPage(chapterId: string, pageIndex: number): Promise<ActionResult> {
  try {
    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { pages: true, comicId: true } });
    if (!chapter) return { success: false, error: "چپتر یافت نشد" };

    await requireUploadAccess(chapter.comicId);

    if (pageIndex < 0 || pageIndex >= chapter.pages.length) {
      return { success: false, error: "صفحه یافت نشد" };
    }

    const removedKey = chapter.pages[pageIndex];
    const nextPages = chapter.pages.filter((_, i) => i !== pageIndex);

    await prisma.chapter.update({ where: { id: chapterId }, data: { pages: nextPages } });
    await deleteObject(removedKey).catch(() => {});

    revalidatePath(`/admin/comics/${chapter.comicId}`);
    revalidatePath(`/publisher/comics/${chapter.comicId}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteComic(comicId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
      select: {
        slug: true,
        chapters: { select: { id: true, pages: true, thumbnailImage: true } },
      },
    });
    if (!comic) return { success: false, error: "عنوان یافت نشد" };

    const chapterIds = comic.chapters.map((c) => c.id);

    await prisma.$transaction([
      prisma.chapterReaction.deleteMany({ where: { chapterId: { in: chapterIds } } }),
      prisma.chapterUnlock.deleteMany({ where: { chapterId: { in: chapterIds } } }),
      prisma.chapterStaff.deleteMany({ where: { chapterId: { in: chapterIds } } }),
      prisma.comment.deleteMany({ where: { chapterId: { in: chapterIds } } }),
      prisma.chapter.deleteMany({ where: { comicId } }),
      prisma.comicGenre.deleteMany({ where: { comicId } }),
      prisma.comicTag.deleteMany({ where: { comicId } }),
      prisma.comicStaff.deleteMany({ where: { comicId } }),
      prisma.bookmark.deleteMany({ where: { comicId } }),
      prisma.readHistory.deleteMany({ where: { comicId } }),
      prisma.comic.delete({ where: { id: comicId } }),
    ]);

    const keysToDelete = comic.chapters
      .flatMap((c) => [...c.pages, c.thumbnailImage])
      .filter((key): key is string => Boolean(key) && !key.startsWith("http://") && !key.startsWith("https://"));
    await Promise.all(keysToDelete.map((key) => deleteObject(key).catch(() => {})));

    revalidatePath("/admin/comics");
    revalidatePath("/app");
    revalidatePath("/app/explore");
    revalidatePath(`/app/comic/${comic.slug}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}