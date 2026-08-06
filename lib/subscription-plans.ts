import "server-only";
import { prisma } from "./prisma";

export interface SubscriptionPlanView {
  id: string;
  label: string;
  months: number;
  priceToman: number;
  isFeatured: boolean;
  perks: string[];
}

export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlanView[]> {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { months: "asc" }],
  });

  return plans.map((plan) => ({
    id: plan.id,
    label: plan.label,
    months: plan.months,
    priceToman: Number(plan.priceToman),
    isFeatured: plan.isFeatured,
    perks: plan.perks,
  }));
}

export async function findActiveSubscriptionPlan(planId: string) {
  return prisma.subscriptionPlan.findFirst({ where: { id: planId, isActive: true } });
}