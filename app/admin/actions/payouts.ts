"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/errors";
import { requireAdmin } from "@/lib/auth";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function reviewPayout(
  payoutId: string,
  decision: "APPROVED" | "REJECTED" | "PAID",
  note?: string,
  paidAmountTon?: number
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status: decision,
        reviewedById: admin.id,
        reviewNote: note?.trim() || null,
        reviewedAt: new Date(),
        paidAt: decision === "PAID" ? new Date() : undefined,
        paidAmountTon: decision === "PAID" && paidAmountTon != null ? paidAmountTon : undefined,
      },
    });
    revalidatePath("/admin/payouts");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}