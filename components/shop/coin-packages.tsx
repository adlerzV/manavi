"use client";

import { useState } from "react";
import type { CoinPackageView } from "@/lib/coin-packages";

interface CoinPackagesProps {
  packages: CoinPackageView[];
  authenticated: boolean;
  gatewayConfigured: boolean;
}

function rate(pack: CoinPackageView): number {
  return pack.priceToman / pack.totalCoins;
}

export function CoinPackages({ packages, authenticated, gatewayConfigured }: CoinPackagesProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bestValueId = packages.length > 0 ? [...packages].sort((a, b) => rate(a) - rate(b))[0].id : null;

  async function handleSelect(packageId: string) {
    if (!authenticated || !gatewayConfigured) return;
    setLoadingId(packageId);
    setError(null);
    try {
      const res = await fetch("/api/payments/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error ?? "خطا در ایجاد پرداخت");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoadingId(null);
    }
  }

  if (packages.length === 0) {
    return <p className="text-sm text-text-muted">در حال حاضر پکیج سکه‌ای برای فروش تعریف نشده است.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {packages.map((pack) => {
          const discountPercent =
            pack.originalPriceToman && pack.originalPriceToman > pack.priceToman
              ? Math.round((1 - pack.priceToman / pack.originalPriceToman) * 100)
              : 0;
          return (
            <button
              key={pack.id}
              onClick={() => handleSelect(pack.id)}
              disabled={!authenticated || !gatewayConfigured || loadingId === pack.id}
              className={`relative rounded-md border p-4 text-center transition-colors disabled:opacity-50 ${
                pack.id === bestValueId ? "border-accent bg-accent/5" : "border-border bg-surface"
              }`}
            >
              {(pack.badge || pack.id === bestValueId) && (
                <span className="absolute -top-2.5 right-1/2 translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                  {pack.badge || "به‌صرفه‌ترین"}
                </span>
              )}
              <p className="text-sm font-medium text-text-main">🪙 {pack.coins.toLocaleString("fa-IR")}</p>
              {pack.bonusCoins > 0 && (
                <p className="text-[11px] text-primary">+{pack.bonusCoins.toLocaleString("fa-IR")} هدیه</p>
              )}
              <p className="mt-2 text-xs text-text-muted">
                {pack.originalPriceToman && discountPercent > 0 && (
                  <span className="ml-1 text-[10px] text-text-muted/60 line-through">
                    {pack.originalPriceToman.toLocaleString("fa-IR")}
                  </span>
                )}
                {pack.priceToman.toLocaleString("fa-IR")} تومان
              </p>
              {discountPercent > 0 && (
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                  {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                </span>
              )}
              {loadingId === pack.id && <span className="mt-1 block text-[11px] text-text-muted">در حال انتقال…</span>}
            </button>
          );
        })}
      </div>
      {!authenticated && <p className="text-xs text-text-muted">برای خرید سکه باید از داخل تلگرام وارد شوید.</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}