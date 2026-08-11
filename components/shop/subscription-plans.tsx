"use client";

import { useRouter } from "next/navigation";
import { TonConnectButton } from "@tonconnect/ui-react";
import { TonPayButton } from "@/components/payments/ton-pay-button";
import { createTonSubscriptionPayment } from "@/app/actions/ton-payments";
import type { SubscriptionPlanView } from "@/lib/subscription-plans";

interface SubscriptionPlansProps {
  plans: SubscriptionPlanView[];
  authenticated: boolean;
  tonConfigured: boolean;
  redirectTo?: string;
}

function monthlyRate(plan: SubscriptionPlanView): number {
  return (plan.priceTon ?? 0) / plan.months;
}

export function SubscriptionPlans({ plans, authenticated, tonConfigured, redirectTo }: SubscriptionPlansProps) {
  const router = useRouter();
  const payable = plans.filter((p) => p.priceTon != null);
  const baseline = payable.length > 0 ? Math.max(...payable.map(monthlyRate)) : 0;

  if (!tonConfigured) {
    return <p className="text-sm text-text-muted">پرداخت با تون هنوز در تنظیمات محیطی پیکربندی نشده است.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => {
          const rate = monthlyRate(plan);
          const savingsPercent = baseline > 0 && plan.priceTon != null ? Math.round((1 - rate / baseline) * 100) : 0;
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col items-center gap-2 rounded-md border p-4 text-center ${
                plan.isFeatured ? "border-primary bg-primary/5" : "border-border bg-surface"
              }`}
            >
              {plan.isFeatured && (
                <span className="absolute -top-2.5 rounded-full bg-primary px-3 py-0.5 text-[10px] font-medium text-primary-foreground">
                  پرطرفدارترین
                </span>
              )}
              <p className="text-sm font-medium text-text-main">{plan.label}</p>
              {plan.priceTon != null ? (
                <p className="text-lg font-semibold text-primary">{plan.priceTon} TON</p>
              ) : (
                <p className="text-xs text-text-muted">قیمت تون تعیین نشده</p>
              )}
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
              {plan.priceTon != null && (
                <div className="mt-2 w-full">
                  <TonPayButton
                    label="پرداخت"
                    disabled={!authenticated}
                    className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
                    createPayment={() => createTonSubscriptionPayment(plan.id)}
                    onPaid={() => (redirectTo ? router.push(redirectTo) : router.refresh())}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!authenticated && <p className="text-xs text-text-muted">برای خرید اشتراک باید از داخل تلگرام وارد شوید.</p>}
    </div>
  );
}