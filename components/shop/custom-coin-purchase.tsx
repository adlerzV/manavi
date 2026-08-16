"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TonPayButton } from "@/components/payments/ton-pay-button";
import { createTonCustomCoinPayment } from "@/app/actions/ton-payments";
import { MAX_CUSTOM_COINS } from "@/lib/billing";

interface CustomCoinPurchaseProps {
  authenticated: boolean;
  coinCost: number;
  coinPriceTon: number;
  redirectTo?: string;
}

export function CustomCoinPurchase({ authenticated, coinCost, coinPriceTon, redirectTo }: CustomCoinPurchaseProps) {
  const router = useRouter();
  const [coins, setCoins] = useState(coinCost);

  const chapters = coins > 0 && coinCost > 0 ? Math.floor(coins / coinCost) : 0;
  const amountTon = useMemo(() => Math.round(coins * coinPriceTon * 1e9) / 1e9, [coins, coinPriceTon]);

  const valid = Number.isFinite(coins) && coins >= coinCost && coins <= MAX_CUSTOM_COINS;

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <div className="space-y-1">
        <label className="text-xs text-text-muted" htmlFor="custom-coins">تعداد سکه</label>
        <input
          id="custom-coins"
          type="number"
          min={coinCost}
          max={MAX_CUSTOM_COINS}
          step={1}
          value={coins}
          onChange={(e) => setCoins(Number(e.target.value))}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="rounded-md bg-background px-3 py-2 text-xs text-text-muted">
        <p>≈ {chapters.toLocaleString("fa-IR")} چپتر سکه‌ای</p>
        <p className="mt-1 text-text-main">مبلغ قابل پرداخت: {amountTon} TON</p>
      </div>

      {!valid && (
        <p className="text-xs text-red-400">
          تعداد سکه باید بین {coinCost.toLocaleString("fa-IR")} و {MAX_CUSTOM_COINS.toLocaleString("fa-IR")} باشد.
        </p>
      )}

      <TonPayButton
        label={`خرید ${coins.toLocaleString("fa-IR")} سکه`}
        disabled={!authenticated || !valid}
        createPayment={() => createTonCustomCoinPayment(coins)}
        onPaid={() => (redirectTo ? router.push(redirectTo) : router.refresh())}
      />
      {!authenticated && <p className="text-center text-xs text-text-muted">برای خرید باید از داخل تلگرام وارد شوید.</p>}
    </div>
  );
}