"use client";

import { useState } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { TonPayButton } from "@/components/payments/ton-pay-button";
import { createTonPublisherPayoutPayment } from "@/app/actions/ton-payments";

interface PublisherPayoutButtonProps {
  publisherId: string;
  publisherName: string;
  suggestedAmountUsdt: number;
  hasWallet: boolean;
  periodStart: string;
  periodEnd: string;
  onPaid?: () => void;
}

export function PublisherPayoutButton({
  publisherId,
  publisherName,
  suggestedAmountUsdt,
  hasWallet,
  periodStart,
  periodEnd,
  onPaid,
}: PublisherPayoutButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(suggestedAmountUsdt));

  const parsedAmount = Number(amount);
  const valid = Number.isFinite(parsedAmount) && parsedAmount > 0;

  if (!hasWallet) {
    return <p className="text-xs text-red-400">کیف پول TON این ناشر ثبت نشده — پرداخت خودکار ممکن نیست.</p>;
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="rounded-md border border-primary px-3 py-1.5 text-xs text-primary">
        پرداخت خودکار با کیف پول من
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3 rounded-md border border-primary/40 bg-primary/5 p-4">
      <p className="text-xs text-text-muted">
        مبلغ مستقیم از کیف پول متصل شما به آدرس ثبت‌شده‌ی <span className="text-text-main">{publisherName}</span> ارسال می‌شه — بدون نگهداری کلید خصوصی روی سرور.
      </p>

      <div className="flex justify-center">
        <TonConnectButton />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-text-muted" htmlFor={`payout-amount-${publisherId}`}>مبلغ (USDT)</label>
        <input
          id={`payout-amount-${publisherId}`}
          type="number"
          step="any"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      {!valid && <p className="text-xs text-red-400">مبلغ باید عددی مثبت باشد</p>}

      <TonPayButton
        label={`پرداخت ${amount || 0} USDT`}
        disabled={!valid}
        createPayment={(walletAddress) =>
          createTonPublisherPayoutPayment({ publisherId, amountUsdt: parsedAmount, periodStart, periodEnd, payerWalletAddress: walletAddress })
        }
        onPaid={() => {
          setOpen(false);
          onPaid?.();
        }}
      />

      <button type="button" onClick={() => setOpen(false)} className="w-full text-center text-xs text-text-muted">
        انصراف
      </button>
    </div>
  );
}