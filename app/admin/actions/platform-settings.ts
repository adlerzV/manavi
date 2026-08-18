"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { logAuditEvent } from "@/lib/audit-log";
import { PLATFORM_SETTINGS_TAG } from "@/lib/platform-settings";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function updatePlatformSettings(input: {
  chapterUnlockCoinCost: number;
  newReleaseThresholdHours: number;
  coinPriceTon: number;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    if (!Number.isFinite(input.chapterUnlockCoinCost) || input.chapterUnlockCoinCost <= 0) {
      return { success: false, error: "قیمت سکه باید عددی مثبت باشد" };
    }
    if (!Number.isFinite(input.newReleaseThresholdHours) || input.newReleaseThresholdHours <= 0) {
      return { success: false, error: "بازه زمانی «جدید» باید عددی مثبت باشد" };
    }
    if (!Number.isFinite(input.coinPriceTon) || input.coinPriceTon <= 0) {
      return { success: false, error: "ارزش سکه به TON باید عددی مثبت باشد" };
    }

    await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {
        chapterUnlockCoinCost: input.chapterUnlockCoinCost,
        newReleaseThresholdHours: input.newReleaseThresholdHours,
        coinPriceTon: input.coinPriceTon,
      },
      create: {
        id: "singleton",
        chapterUnlockCoinCost: input.chapterUnlockCoinCost,
        newReleaseThresholdHours: input.newReleaseThresholdHours,
        coinPriceTon: input.coinPriceTon,
      },
    });

    after(() =>
      logAuditEvent({
        actorId: admin.id,
        actorRole: admin.role,
        action: "platformSettings.update",
        targetType: "PlatformSettings",
        targetId: "singleton",
        metadata: input,
      })
    );

    revalidateTag(PLATFORM_SETTINGS_TAG, "max");
    revalidatePath("/admin/settings");
    revalidatePath("/app/shop");

    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}