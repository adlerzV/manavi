"use client";

import { useState } from "react";
import { useTonConnectUI, useTonAddress } from "@tonconnect/ui-react";
import { buildTonCommentPayload, TON_TRANSACTION_VALID_SECONDS } from "@/lib/ton-client";
import { verifyTonPayment, type TonPaymentRequest } from "@/app/actions/ton-payments";

const VERIFY_POLL_INTERVAL_MS = 3000;
const VERIFY_MAX_ATTEMPTS = 20;

interface TonPayButtonProps {
  label: string;
  disabled?: boolean;
  className?: string;
  createPayment: () => Promise<{ success: boolean; error?: string; data?: TonPaymentRequest }>;
  onPaid?: () => void;
}

type Status = "idle" | "creating" | "awaiting-wallet" | "verifying" | "error" | "done";

export function TonPayButton({ label, disabled, className, createPayment, onPaid }: TonPayButtonProps) {
  const [tonConnectUI] = useTonConnectUI();
  const walletAddress = useTonAddress();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function pollVerification(transactionId: string) {
    for (let attempt = 0; attempt < VERIFY_MAX_ATTEMPTS; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, VERIFY_POLL_INTERVAL_MS));
      const result = await verifyTonPayment(transactionId);
      if (!result.success) {
        setStatus("error");
        setError(result.error ?? "خطا در تایید تراکنش");
        return;
      }
      if (result.data?.status === "PAID") {
        setStatus("done");
        onPaid?.();
        return;
      }
      if (result.data?.status === "FAILED") {
        setStatus("error");
        setError("تراکنش ناموفق بود");
        return;
      }
    }
    setStatus("error");
    setError("تایید تراکنش زمان زیادی طول کشید — اگر مبلغ کسر شده، چند دقیقه دیگر صفحه را رفرش کنید");
  }

  async function handleClick() {
    setError(null);

    if (!walletAddress) {
      try {
        await tonConnectUI.openModal();
      } catch {}
      return;
    }

    setStatus("creating");
    const result = await createPayment();
    if (!result.success || !result.data) {
      setStatus("error");
      setError(result.error ?? "خطا در ایجاد تراکنش");
      return;
    }

    setStatus("awaiting-wallet");
    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + TON_TRANSACTION_VALID_SECONDS,
        messages: [
          {
            address: result.data.toAddress,
            amount: result.data.amountNanotons,
            payload: buildTonCommentPayload(result.data.comment),
          },
        ],
      });
    } catch {
      setStatus("idle");
      return;
    }

    setStatus("verifying");
    await pollVerification(result.data.transactionId);
  }

  const busy = status === "creating" || status === "awaiting-wallet" || status === "verifying";

  return (
    <div className="space-y-1">
      <button
        onClick={handleClick}
        disabled={disabled || busy}
        className={className ?? "w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"}
      >
        {!walletAddress && "اتصال کیف پول تون"}
        {walletAddress && status === "creating" && "در حال آماده‌سازی…"}
        {walletAddress && status === "awaiting-wallet" && "در انتظار تایید در کیف پول…"}
        {walletAddress && status === "verifying" && "در حال تایید تراکنش…"}
        {walletAddress && (status === "idle" || status === "error" || status === "done") && label}
      </button>
      {status === "done" && <p className="text-center text-xs text-primary">پرداخت با موفقیت تایید شد</p>}
      {error && <p className="text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}