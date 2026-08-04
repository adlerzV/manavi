"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { extractDominantColor } from "@/lib/color";
import { LicenseStatus, ContentType, ReadingMode } from "@prisma/client";

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
      },
    });

    revalidatePath("/admin/comics");
    return { success: true, data: { id: comic.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}