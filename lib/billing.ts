
export const DONATION_PRESETS_TON = [0.5, 1, 2, 5];
export const MIN_DONATION_TON = 0.2;
export const MAX_DONATION_TON = 1000;

export function hasActiveSubscription(subscriptionEnd: Date | null | undefined): boolean {
  return Boolean(subscriptionEnd && subscriptionEnd > new Date());
}