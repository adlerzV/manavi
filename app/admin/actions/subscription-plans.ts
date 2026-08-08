"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface SubscriptionPlanRow {
  id: string;
  label: string;
  months: number;
  priceToman: number;
  priceTon: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  perks: string[];
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlanRow[]> {
  await requireAdmin();
  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: [{ sortOrder: "asc" }, { months: "asc" }],
  });
  return plans.map((p) => ({
    id: p.id,
    label: p.label,
    months: p.months,
    priceToman: Number(p.priceToman),
    priceTon: p.priceTon != null ? Number(p.priceTon) : null,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    perks: p.perks,
  }));
}

export async function createSubscriptionPlan(input: {
  label: string;
  months: number;
  priceToman: number;
  priceTon?: number | null;
  isFeatured: boolean;
  sortOrder: number;
  perks: string[];
}): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const label = input.label.trim();
    if (!label) return { success: false, error: "عنوان پلن الزامی است" };
    if (!Number.isFinite(input.months) || input.months <= 0)
      return { success: false, error: "تعداد ماه باید عددی مثبت باشد" };
    if (!Number.isFinite(input.priceToman) || input.priceToman <= 0)
      return { success: false, error: "قیمت باید عددی مثبت باشد" };

    const priceTon =
      input.priceTon && Number.isFinite(input.priceTon) && input.priceTon > 0
        ? input.priceTon
        : null;

    const perks = input.perks.map((p) => p.trim()).filter(Boolean).slice(0, 8);

    const plan = await prisma.subscriptionPlan.create({
      data: {
        label,
        months: input.months,
        priceToman: input.priceToman,
        priceTon,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
        perks,
      },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/app/shop");
    return { success: true, data: { id: plan.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateSubscriptionPlan(
  planId: string,
  input: {
    label: string;
    months: number;
    priceToman: number;
    priceTon?: number | null;
    isActive: boolean;
    isFeatured: boolean;
    sortOrder: number;
    perks: string[];
  }
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const label = input.label.trim();
    if (!label) return { success: false, error: "عنوان پلن الزامی است" };
    if (!Number.isFinite(input.months) || input.months <= 0)
      return { success: false, error: "تعداد ماه باید عددی مثبت باشد" };
    if (!Number.isFinite(input.priceToman) || input.priceToman <= 0)
      return { success: false, error: "قیمت باید عددی مثبت باشد" };

    const priceTon =
      input.priceTon && Number.isFinite(input.priceTon) && input.priceTon > 0
        ? input.priceTon
        : null;

    const perks = input.perks.map((p) => p.trim()).filter(Boolean).slice(0, 8);

    await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: {
        label,
        months: input.months,
        priceToman: input.priceToman,
        priceTon,
        isActive: input.isActive,
        isFeatured: input.isFeatured,
        sortOrder: input.sortOrder,
        perks,
      },
    });

    revalidatePath("/admin/subscriptions");
    revalidatePath("/app/shop");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function toggleSubscriptionPlanActive(
  planId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.subscriptionPlan.update({ where: { id: planId }, data: { isActive } });
    revalidatePath("/admin/subscriptions");
    revalidatePath("/app/shop");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteSubscriptionPlan(planId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const inUse = await prisma.transaction.count({ where: { subscriptionPlanId: planId } });
    if (inUse > 0) {
      await prisma.subscriptionPlan.update({ where: { id: planId }, data: { isActive: false } });
      revalidatePath("/admin/subscriptions");
      revalidatePath("/app/shop");
      return { success: true };
    }
    await prisma.subscriptionPlan.delete({ where: { id: planId } });
    revalidatePath("/admin/subscriptions");
    revalidatePath("/app/shop");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}