"use client";

import { useState } from "react";
import { SUBSCRIPTION_PLANS } from "@/lib/billing";

export function SubscriptionPlans({ authenticated }: { authenticated: boolean }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleSelect(planId: string) {
    if (!authenticated) return;
    setLoadingId(planId);
    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
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
      {SUBSCRIPTION_PLANS.map((plan) => (
        <button
          key={plan.id}
          onClick={() => handleSelect(plan.id)}
          disabled={!authenticated || loadingId === plan.id}
          className="rounded-md border border-border bg-surface p-4 text-center disabled:opacity-50"
        >
          <p className="text-sm font-medium text-text-main">{plan.label}</p>
          <p className="mt-2 text-xs text-text-muted">{plan.priceToman.toLocaleString("fa-IR")} تومان</p>
        </button>
      ))}
    </div>
  );
}