import { listCoinPackages } from "@/app/admin/actions/coin-packages";
import { getTomanPerUsdt } from "@/lib/platform-settings";
import { CoinPackageManager } from "@/components/admin/coin-package-manager";

export default async function AdminCoinPackagesPage() {
  const [packages, tomanPerUsdt] = await Promise.all([listCoinPackages(), getTomanPerUsdt()]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-main">پکیج‌های سکه</h1>
        <p className="mt-1 text-sm text-text-muted">
          تا وقتی پکیجی فعال نکنید، فروشگاه سکه برای کاربران خالی نمایش داده می‌شود.
        </p>
      </div>
      <CoinPackageManager initialPackages={packages} tomanPerUsdt={tomanPerUsdt} />
    </div>
  );
}