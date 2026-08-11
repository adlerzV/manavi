import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const PLATFORM_SETTINGS_TAG = "platform-settings";

async function fetchPlatformSettings() {
  const settings = await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return settings;
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