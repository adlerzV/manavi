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
  coinCost: number;
  tomanPerUsdt: number;
}

function rate(pack: CoinPackageView): number {
  return pack.priceUsdt / pack.totalCoins;
}

export function CoinPackages({ packages, authenticated, tonConfigured, redirectTo, coinCost, tomanPerUsdt }: CoinPackagesProps) {
  const router = useRouter();
  const bestValueId = packages.length > 0 ? [...packages].sort((a, b) => rate(a) - rate(b))[0].id : null;

  if (packages.length === 0) {
    return <p className="text-sm text-text-muted">در حال حاضر پکیج سکه‌ای برای فروش تعریف نشده است.</p>;
  }
  if (!tonConfigured) {
    return <p className="text-sm text-text-muted">پرداخت هنوز در تنظیمات محیطی پیکربندی نشده است.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {packages.map((pack) => {
          const discountPercent =
            pack.originalPriceUsdt && pack.originalPriceUsdt > pack.priceUsdt
              ? Math.round((1 - pack.priceUsdt / pack.originalPriceUsdt) * 100)
              : 0;
          const equivalentChapters = coinCost > 0 ? Math.floor(pack.totalCoins / coinCost) : 0;
          const tomanEquivalent = tomanPerUsdt > 0 ? Math.round(pack.priceUsdt * tomanPerUsdt) : null;
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
              {equivalentChapters > 0 && (
                <p className="mt-1 text-[10px] text-text-muted">≈ {equivalentChapters.toLocaleString("fa-IR")} چپتر</p>
              )}
              {discountPercent > 0 && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                  {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                </span>
              )}
              <div className="mt-3">
                <TonPayButton
                  label={`${pack.priceUsdt} USDT`}
                  disabled={!authenticated}
                  className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                  createPayment={(walletAddress) => createTonCoinPayment(pack.id, walletAddress)}
                  onPaid={() => (redirectTo ? router.push(redirectTo) : router.refresh())}
                />
                {tomanEquivalent !== null && (
                  <p className="mt-1 text-[10px] text-text-muted">≈ {tomanEquivalent.toLocaleString("fa-IR")} تومان</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!authenticated && <p className="text-xs text-text-muted">برای خرید سکه باید از داخل تلگرام وارد شوید.</p>}
    </div>
  );
}