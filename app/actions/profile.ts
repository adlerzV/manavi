"use server";

import { revalidatePath } from "next/cache";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sanitizeCustomLinks, type ProfileLink } from "@/lib/profile-links";

export async function updateContentPreference(preference: AgeRating): Promise<{ success: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { contentPreference: preference },
  });

  revalidatePath("/app");
  revalidatePath("/app/explore");
  revalidatePath("/app/profile");

  return { success: true };
}

export async function updateProfileDetails(input: {
  bio?: string;
  avatarUrl?: string;
  donationLink?: string;
  cryptoWalletLabel?: string;
  cryptoWalletAddress?: string;
  customLinks?: ProfileLink[];
}): Promise<{ success: boolean; error?: string }> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "برای ویرایش پروفایل باید وارد شوید" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      bio: input.bio?.trim().slice(0, 500) || null,
      avatarUrl: input.avatarUrl?.trim() || null,
      donationLink: input.donationLink?.trim() || null,
      cryptoWalletLabel: input.cryptoWalletLabel?.trim().slice(0, 60) || null,
      cryptoWalletAddress: input.cryptoWalletAddress?.trim().slice(0, 200) || null,
      customLinks: sanitizeCustomLinks(input.customLinks ?? []),
    },
  });

  revalidatePath("/app/profile");
  revalidatePath(`/app/team/${user.id}`);

  return { success: true };
}