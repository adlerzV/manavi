"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { sanitizeCustomLinks, type ProfileLink } from "@/lib/profile-links";

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
  cryptoWalletLabel?: string;
  cryptoWalletAddress?: string;
  customLinks?: ProfileLink[];
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
        cryptoWalletLabel: input.cryptoWalletLabel?.trim().slice(0, 60) || null,
        cryptoWalletAddress: input.cryptoWalletAddress?.trim().slice(0, 200) || null,
        customLinks: sanitizeCustomLinks(input.customLinks ?? []),
      },
    });

    revalidatePath("/publisher/profile");
    revalidatePath(`/app/publisher/${user.publisherProfile.id}`);
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}