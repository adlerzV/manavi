"use client";

import { useRouter } from "next/navigation";
import { TonConnectButton } from "@tonconnect/ui-react";
import { TonPayButton } from "@/components/payments/ton-pay-button";
import { createTonCoinPayment } from "@/app/actions/ton-payments";
import type { CoinPackageView } from "@/lib/coin-packages";

interface CoinPackagesProps {
  packages: CoinPackageView[];
  authenticated: boolean;
  tonConfigured: boolean;
  redirectTo?: string;
}

function rate(pack: CoinPackageView): number {
  return (pack.priceTon ?? 0) / pack.totalCoins;
}

export function CoinPackages({ packages, authenticated, tonConfigured, redirectTo }: CoinPackagesProps) {
  const router = useRouter();
  const payable = packages.filter((p) => p.priceTon != null);
  const bestValueId = payable.length > 0 ? [...payable].sort((a, b) => rate(a) - rate(b))[0].id : null;

  if (packages.length === 0) {
    return <p className="text-sm text-text-muted">در حال حاضر پکیج سکه‌ای برای فروش تعریف نشده است.</p>;
  }
  if (!tonConfigured) {
    return <p className="text-sm text-text-muted">پرداخت با تون هنوز در تنظیمات محیطی پیکربندی نشده است.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {packages.map((pack) => {
          const discountPercent =
            pack.originalPriceToman && pack.originalPriceToman > pack.priceToman
              ? Math.round((1 - pack.priceToman / pack.originalPriceToman) * 100)
              : 0;
          return (
            <div
              key={pack.id}
              className={`relative rounded-md border p-4 text-center ${
                pack.id === bestValueId ? "border-accent bg-accent/5" : "border-border bg-surface"
              }`}
            >
              {(pack.badge || pack.id === bestValueId) && (
                <span className="absolute -top-2.5 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {pack.badge || "به‌صرفه‌ترین"}
                </span>
              )}
              <p className="text-sm font-medium text-text-main">🪙 {pack.coins.toLocaleString("fa-IR")}</p>
              {pack.bonusCoins > 0 && <p className="text-[11px] text-primary">+{pack.bonusCoins.toLocaleString("fa-IR")} هدیه</p>}
              {discountPercent > 0 && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                  {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                </span>
              )}
              {pack.priceTon != null ? (
                <div className="mt-3">
                  <TonPayButton
                    label={`${pack.priceTon} TON`}
                    disabled={!authenticated}
                    className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                    createPayment={() => createTonCoinPayment(pack.id)}
                    onPaid={() => (redirectTo ? router.push(redirectTo) : router.refresh())}
                  />
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-text-muted">قیمت تون تعیین نشده</p>
              )}
            </div>
          );
        })}
      </div>
      {!authenticated && <p className="text-xs text-text-muted">برای خرید سکه باید از داخل تلگرام وارد شوید.</p>}
    </div>
  );
}