"use client";

import { useState } from "react";
import { COIN_PACKAGES } from "@/lib/billing";

interface CoinPackagesProps {
  authenticated: boolean;
  gatewayConfigured: boolean;
}

export function CoinPackages({ authenticated, gatewayConfigured }: CoinPackagesProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bestValueId = [...COIN_PACKAGES].sort((a, b) => a.priceToman / a.coins - b.priceToman / b.coins)[0]?.id;

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

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {COIN_PACKAGES.map((pack) => (
          <button
            key={pack.id}
            onClick={() => handleSelect(pack.id)}
            disabled={!authenticated || !gatewayConfigured || loadingId === pack.id}
            className={`relative rounded-md border p-4 text-center transition-colors disabled:opacity-50 ${
              pack.id === bestValueId ? "border-accent bg-accent/5" : "border-border bg-surface"
            }`}
          >
            {pack.id === bestValueId && (
              <span className="absolute -top-2.5 right-1/2 translate-x-1/2 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                به‌صرفه‌ترین
              </span>
            )}
            <p className="text-sm font-medium text-text-main">🪙 {pack.coins.toLocaleString("fa-IR")}</p>
            <p className="mt-2 text-xs text-text-muted">{pack.priceToman.toLocaleString("fa-IR")} تومان</p>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}