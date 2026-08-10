"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/errors";
import { getSessionUser } from "@/lib/auth";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function requestPayout(input: { amountToman: number; periodStart: string; periodEnd: string }): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    if (!user?.publisherProfile) {
      return { success: false, error: "دسترسی غیرمجاز" };
    }
    if (input.amountToman <= 0) {
      return { success: false, error: "مبلغ باید مثبت باشد" };
    }

    await prisma.payoutRequest.create({
      data: {
        publisherId: user.publisherProfile.id,
        amountToman: input.amountToman,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
      },
    });

    revalidatePath("/publisher/payouts");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}