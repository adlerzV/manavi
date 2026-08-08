export interface SubscriptionPlan {
  id: string;
  months: number;
  priceToman: number;
  label: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: "1m", months: 1, priceToman: 79000, label: "۱ ماهه" },
  { id: "3m", months: 3, priceToman: 199000, label: "۳ ماهه" },
  { id: "12m", months: 12, priceToman: 690000, label: "۱۲ ماهه" },
];

export function findSubscriptionPlan(id: string) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
}

export const COIN_CHAPTER_UNLOCK_COST = 15;

export const DONATION_PRESETS_TOMAN = [10000, 25000, 50000, 100000];
export const MIN_DONATION_TOMAN = 5000;
export const MAX_DONATION_TOMAN = 5000000;

export const DONATION_PRESETS_TON = [0.5, 1, 2, 5];
export const MIN_DONATION_TON = 0.2;
export const MAX_DONATION_TON = 1000;