import { getPlatformSettings } from "@/lib/platform-settings";
import { PlatformSettingsForm } from "@/components/admin/platform-settings-form";

export default async function AdminSettingsPage() {
  const settings = await getPlatformSettings();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">تنظیمات سراسری</h1>
      <PlatformSettingsForm
        initialCoinCost={settings.chapterUnlockCoinCost}
        initialThresholdHours={settings.newReleaseThresholdHours}
        initialCoinPriceUsdt={Number(settings.coinPriceUsdt)}
        initialTomanPerUsdt={settings.tomanPerUsdt}
        initialReferralRewardCoins={settings.referralRewardCoins}
      />
    </div>
  );
}