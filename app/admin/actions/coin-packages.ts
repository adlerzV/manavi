"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CoinPackageRow {
  id: string;
  coins: number;
  bonusCoins: number;
  priceToman: number;
  originalPriceToman: number | null;
  badge: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
}

export async function listCoinPackages(): Promise<CoinPackageRow[]> {
  await requireAdmin();
  const packages = await prisma.coinPackage.findMany({ orderBy: [{ sortOrder: "asc" }, { coins: "asc" }] });
  return packages.map((p) => ({
    id: p.id,
    coins: p.coins,
    bonusCoins: p.bonusCoins,
    priceToman: Number(p.priceToman),
    originalPriceToman: p.originalPriceToman ? Number(p.originalPriceToman) : null,
    badge: p.badge,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
  }));
}

function validate(input: { coins: number; bonusCoins: number; priceToman: number; originalPriceToman?: number }) {
  if (!Number.isFinite(input.coins) || input.coins <= 0) return "تعداد سکه باید عددی مثبت باشد";
  if (!Number.isFinite(input.priceToman) || input.priceToman <= 0) return "قیمت باید عددی مثبت باشد";
  if (input.bonusCoins < 0) return "سکه هدیه نمی‌تواند منفی باشد";
  if (input.originalPriceToman != null && input.originalPriceToman <= input.priceToman) {
    return "قیمت قبل از تخفیف باید بیشتر از قیمت فعلی باشد";
  }
  return null;
}

export async function createCoinPackage(input: {
  coins: number;
  bonusCoins: number;
  priceToman: number;
  originalPriceToman?: number;
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
        priceToman: input.priceToman,
        originalPriceToman: input.originalPriceToman ?? null,
        badge: input.badge?.trim() || null,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
      },
    });

    revalidatePath("/admin/coin-packages");
    revalidatePath("/app/shop");
    return { success: true, data: { id: pack.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateCoinPackage(
  packageId: string,
  input: {
    coins: number;
    bonusCoins: number;
    priceToman: number;
    originalPriceToman?: number;
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
        priceToman: input.priceToman,
        originalPriceToman: input.originalPriceToman ?? null,
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
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
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
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
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
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}