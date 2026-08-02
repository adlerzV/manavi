"use server";

import { revalidatePath } from "next/cache";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

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