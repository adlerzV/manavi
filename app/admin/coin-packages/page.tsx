import { listCoinPackages } from "@/app/admin/actions/coin-packages";
import { getTomanPerUsdt, getCoinPriceUsdt } from "@/lib/platform-settings";
import { CoinPackageManager } from "@/components/admin/coin-package-manager";

export default async function AdminCoinPackagesPage() {
  const [packages, tomanPerUsdt, coinPriceUsdt] = await Promise.all([
    listCoinPackages(),
    getTomanPerUsdt(),
    getCoinPriceUsdt(),
  ]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-main">پکیج‌های سکه</h1>
        <p className="mt-1 text-sm text-text-muted">
          قیمت هر پکیج به‌صورت خودکار از «ارزش هر سکه به تتر» در تنظیمات سراسری محاسبه می‌شود — فقط تعداد سکه و سکه هدیه را تعیین کنید.
        </p>
      </div>
      <CoinPackageManager initialPackages={packages} tomanPerUsdt={tomanPerUsdt} coinPriceUsdt={coinPriceUsdt} />
    </div>
  );
}