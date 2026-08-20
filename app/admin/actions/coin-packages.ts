"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { getCoinPriceUsdt } from "@/lib/platform-settings";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CoinPackageRow {
  id: string;
  coins: number;
  bonusCoins: number;
  priceUsdt: number;
  badge: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

export async function listCoinPackages(): Promise<CoinPackageRow[]> {
  await requireAdmin();
  const [packages, coinPriceUsdt] = await Promise.all([
    prisma.coinPackage.findMany({ orderBy: [{ sortOrder: "asc" }, { coins: "asc" }] }),
    getCoinPriceUsdt(),
  ]);
  return packages.map((p) => ({
    id: p.id,
    coins: p.coins,
    bonusCoins: p.bonusCoins,
    priceUsdt: Math.round(p.coins * coinPriceUsdt * 1e6) / 1e6,
    badge: p.badge,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  }));
}

function validate(input: { coins: number; bonusCoins: number }) {
  if (!Number.isFinite(input.coins) || input.coins <= 0) return "تعداد سکه باید عددی مثبت باشد";
  if (!Number.isInteger(input.coins)) return "تعداد سکه باید عدد صحیح باشد";
  if (!Number.isFinite(input.bonusCoins) || input.bonusCoins < 0) return "سکه هدیه نمی‌تواند منفی باشد";
  return null;
}

export async function createCoinPackage(input: {
  coins: number;
  bonusCoins: number;
  badge?: string;
  isFeatured: boolean;
  sortOrder: number;
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();
    const error = validate(input);
    if (error) return { success: false, error };

    const pack = await prisma.coinPackage.create({
      data: {
        coins: input.coins,
        bonusCoins: input.bonusCoins,
        badge: input.badge?.trim() || null,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
      },
    });

    revalidatePath("/admin/coin-packages");
    revalidatePath("/app/shop");
    return { success: true, data: { id: pack.id } };
  } catch (err) {
    return safeError(err);
  }
}

export async function updateCoinPackage(
  packageId: string,
  input: {
    coins: number;
    bonusCoins: number;
    badge?: string;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
  }
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const error = validate(input);
    if (error) return { success: false, error };

    await prisma.coinPackage.update({
      where: { id: packageId },
      data: {
        coins: input.coins,
        bonusCoins: input.bonusCoins,
        badge: input.badge?.trim() || null,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
      },
    });

    revalidatePath("/admin/coin-packages");
    revalidatePath("/app/shop");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export async function toggleCoinPackageActive(packageId: string, isActive: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.coinPackage.update({ where: { id: packageId }, data: { isActive } });
    revalidatePath("/admin/coin-packages");
    revalidatePath("/app/shop");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export async function deleteCoinPackage(packageId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const inUse = await prisma.transaction.count({ where: { coinPackageId: packageId } });
    if (inUse > 0) {
      await prisma.coinPackage.update({ where: { id: packageId }, data: { isActive: false } });
      revalidatePath("/admin/coin-packages");
      revalidatePath("/app/shop");
      return { success: true };
    }

    await prisma.coinPackage.delete({ where: { id: packageId } });
    revalidatePath("/admin/coin-packages");
    revalidatePath("/app/shop");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}