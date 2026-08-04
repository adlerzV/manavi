"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function updatePublisherProfile(input: {
  bio?: string;
  avatarUrl?: string;
  telegramUrl?: string;
  instagramUrl?: string;
  websiteUrl?: string;
  donationCardNumber?: string;
  donationLink?: string;
}): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user?.publisherProfile) {
      return { success: false, error: "پروفایل ناشر یافت نشد" };
    }

    await prisma.publisher.update({
      where: { id: user.publisherProfile.id },
      data: {
        bio: input.bio?.trim() || null,
        avatarUrl: input.avatarUrl || null,
        telegramUrl: input.telegramUrl?.trim() || null,
        instagramUrl: input.instagramUrl?.trim() || null,
        websiteUrl: input.websiteUrl?.trim() || null,
        donationCardNumber: input.donationCardNumber?.trim() || null,
        donationLink: input.donationLink?.trim() || null,
      },
    });

    revalidatePath("/publisher/profile");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}