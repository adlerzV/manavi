"use client";

import { useState } from "react";
import { COIN_PACKAGES } from "@/lib/billing";

export function CoinPackages({ authenticated }: { authenticated: boolean }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleSelect(packageId: string) {
    if (!authenticated) return;
    setLoadingId(packageId);
    try {
      const res = await fetch("/api/payments/coins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {COIN_PACKAGES.map((pack) => (
        <button
          key={pack.id}
          onClick={() => handleSelect(pack.id)}
          disabled={!authenticated || loadingId === pack.id}
          className="rounded-md border border-border bg-surface p-4 text-center disabled:opacity-50"
        >
          <p className="text-sm font-medium text-text-main">{pack.coins} سکه</p>
          <p className="mt-2 text-xs text-text-muted">{pack.priceToman.toLocaleString("fa-IR")} تومان</p>
        </button>
      ))}
    </div>
  );
}