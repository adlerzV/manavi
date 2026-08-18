import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const PLATFORM_SETTINGS_TAG = "platform-settings";

async function fetchPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
}

export const getPlatformSettings = unstable_cache(fetchPlatformSettings, ["platform-settings:singleton"], {
  revalidate: 300,
  tags: [PLATFORM_SETTINGS_TAG],
});

export async function getChapterUnlockCoinCost(): Promise<number> {
  return (await getPlatformSettings()).chapterUnlockCoinCost;
}
export async function getNewReleaseThresholdHours(): Promise<number> {
  return (await getPlatformSettings()).newReleaseThresholdHours;
}
export async function getCoinPriceUsdt(): Promise<number> {
  return Number((await getPlatformSettings()).coinPriceUsdt);
}
export async function getTomanPerUsdt(): Promise<number> {
  return (await getPlatformSettings()).tomanPerUsdt;
}

export function usdtToToman(amountUsdt: number, tomanPerUsdt: number): number {
  if (!tomanPerUsdt) return 0;
  return Math.round(amountUsdt * tomanPerUsdt);
}