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
  coinPriceUsdt: number;
  tomanPerUsdt: number;
  referralRewardCoins: number;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    if (!Number.isFinite(input.chapterUnlockCoinCost) || input.chapterUnlockCoinCost <= 0) {
      return { success: false, error: "قیمت سکه باید عددی مثبت باشد" };
    }
    if (!Number.isFinite(input.newReleaseThresholdHours) || input.newReleaseThresholdHours <= 0) {
      return { success: false, error: "بازه زمانی «جدید» باید عددی مثبت باشد" };
    }
    if (!Number.isFinite(input.coinPriceUsdt) || input.coinPriceUsdt <= 0) {
      return { success: false, error: "ارزش سکه به USDT باید عددی مثبت باشد" };
    }
    if (!Number.isFinite(input.tomanPerUsdt) || input.tomanPerUsdt < 0) {
      return { success: false, error: "نرخ تومان به ازای هر USDT نامعتبر است" };
    }
    if (!Number.isFinite(input.referralRewardCoins) || input.referralRewardCoins < 0) {
      return { success: false, error: "سکه هدیه دعوت نمی‌تواند منفی باشد" };
    }

    await prisma.platformSettings.upsert({
      where: { id: "singleton" },
      update: {
        chapterUnlockCoinCost: input.chapterUnlockCoinCost,
        newReleaseThresholdHours: input.newReleaseThresholdHours,
        coinPriceUsdt: input.coinPriceUsdt,
        tomanPerUsdt: input.tomanPerUsdt,
        referralRewardCoins: input.referralRewardCoins,
      },
      create: {
        id: "singleton",
        chapterUnlockCoinCost: input.chapterUnlockCoinCost,
        newReleaseThresholdHours: input.newReleaseThresholdHours,
        coinPriceUsdt: input.coinPriceUsdt,
        tomanPerUsdt: input.tomanPerUsdt,
        referralRewardCoins: input.referralRewardCoins,
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