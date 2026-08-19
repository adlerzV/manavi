"use client";

import { useState } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { TonPayButton } from "@/components/payments/ton-pay-button";
import { createTonDonationPayment } from "@/app/actions/ton-payments";
import { DONATION_PRESETS_USDT, MIN_DONATION_USDT, MAX_DONATION_USDT } from "@/lib/billing";

interface DonateButtonProps {
  receiverId: string;
  authenticated: boolean;
}

export function DonateButton({ receiverId, authenticated }: DonateButtonProps) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<number>(DONATION_PRESETS_USDT[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");

  const effectiveAmount = customAmount ? Number(customAmount) : preset;
  const validAmount =
    Number.isFinite(effectiveAmount) &&
    effectiveAmount >= MIN_DONATION_USDT &&
    effectiveAmount <= MAX_DONATION_USDT;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={!authenticated}
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        حمایت مالی
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-3 rounded-md border border-border bg-surface p-4">
      <div className="flex justify-center">
        <TonConnectButton />
      </div>

      <div className="flex flex-wrap gap-2">
        {DONATION_PRESETS_USDT.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPreset(p);
              setCustomAmount("");
            }}
            className={`rounded-md border px-3 py-1.5 text-xs ${
              !customAmount && preset === p
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-text-muted"
            }`}
          >
            {p} USDT
          </button>
        ))}
      </div>

      <input
        type="number"
        step="any"
        min={MIN_DONATION_USDT}
        max={MAX_DONATION_USDT}
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        placeholder={`مبلغ دلخواه (${MIN_DONATION_USDT} تا ${MAX_DONATION_USDT} USDT)`}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
      />

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="پیام (اختیاری)"
        maxLength={300}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
      />

      {!validAmount && (
        <p className="text-xs text-red-400">
          مبلغ باید بین {MIN_DONATION_USDT} تا {MAX_DONATION_USDT} USDT باشد
        </p>
      )}

      <TonPayButton
        label={`حمایت با ${effectiveAmount || 0} USDT`}
        disabled={!authenticated || !validAmount}
        createPayment={(walletAddress) =>
          createTonDonationPayment({
            receiverId,
            amountUsdt: effectiveAmount,
            message: message || undefined,
            payerWalletAddress: walletAddress,
          })
        }
      />

      <button type="button" onClick={() => setOpen(false)} className="w-full text-center text-xs text-text-muted">
        انصراف
      </button>
    </div>
  );
}