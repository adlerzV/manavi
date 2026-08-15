"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser, invalidateSessionUserCache } from "@/lib/auth";
import { safeError } from "@/lib/errors";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function setAgeVerified(verified: boolean): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user) {
      return { success: false, error: "برای این عملیات باید وارد شوید" };
    }

    if (user.isAgeVerified !== verified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isAgeVerified: verified },
      });
      await invalidateSessionUserCache(user.id);
    }

    revalidatePath("/app/profile");
    revalidatePath("/app");
    revalidatePath("/app/explore");

    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}