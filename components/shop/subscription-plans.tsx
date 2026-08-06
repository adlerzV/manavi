"use client";

import { useState } from "react";
import type { SubscriptionPlanView } from "@/lib/subscription-plans";

interface SubscriptionPlansProps {
  plans: SubscriptionPlanView[];
  authenticated: boolean;
  gatewayConfigured: boolean;
}

function monthlyRate(plan: SubscriptionPlanView): number {
  return plan.priceToman / plan.months;
}

export function SubscriptionPlans({ plans, authenticated, gatewayConfigured }: SubscriptionPlansProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const baseline = Math.max(...plans.map(monthlyRate));

  async function handleSelect(planId: string) {
    if (!authenticated || !gatewayConfigured) return;
    setLoadingId(planId);
    setError(null);
    try {
      const res = await fetch("/api/payments/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
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
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const rate = monthlyRate(plan);
          const savingsPercent = baseline > 0 ? Math.round((1 - rate / baseline) * 100) : 0;
          return (
            <button
              key={plan.id}
              onClick={() => handleSelect(plan.id)}
              disabled={!authenticated || !gatewayConfigured || loadingId === plan.id}
              className={`relative flex flex-col items-center gap-2 rounded-md border p-4 text-center transition-colors disabled:opacity-50 ${
                plan.isFeatured ? "border-primary bg-primary/5" : "border-border bg-surface"
              }`}
            >
              {plan.isFeatured && (
                <span className="absolute -top-2.5 rounded-full bg-primary px-3 py-0.5 text-[10px] font-medium text-primary-foreground">
                  پرطرفدارترین
                </span>
              )}
              <p className="text-sm font-medium text-text-main">{plan.label}</p>
              <p className="text-lg font-semibold text-primary">{plan.priceToman.toLocaleString("fa-IR")} تومان</p>
              {savingsPercent > 0 && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                  {savingsPercent.toLocaleString("fa-IR")}٪ صرفه‌جویی
                </span>
              )}
              {plan.perks.length > 0 && (
                <ul className="mt-1 space-y-1 text-right text-[11px] text-text-muted">
                  {plan.perks.map((perk) => (
                    <li key={perk}>• {perk}</li>
                  ))}
                </ul>
              )}
              {loadingId === plan.id && <span className="text-[11px] text-text-muted">در حال انتقال…</span>}
            </button>
          );
        })}
      </div>
      {!authenticated && <p className="text-xs text-text-muted">برای خرید اشتراک باید از داخل تلگرام وارد شوید.</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}