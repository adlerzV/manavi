"use client";

import { useState, useTransition } from "react";
import { reviewPayout } from "@/app/admin/actions/payouts";

export function PayoutReviewPanel({ payoutId, publisherName, amountTon }: { payoutId: string; publisherName: string; amountTon: number | null }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [paidAmount, setPaidAmount] = useState(amountTon != null ? String(amountTon) : "");
  const [showPaidInput, setShowPaidInput] = useState(false);

  function handleReview(decision: "APPROVED" | "REJECTED" | "PAID") {
    if (decision === "PAID" && !showPaidInput) {
      setShowPaidInput(true);
      return;
    }
    startTransition(async () => {
      const result = await reviewPayout(
        payoutId,
        decision,
        undefined,
        decision === "PAID" ? Number(paidAmount) || undefined : undefined
      );
      if (result.success) setDone(true);
    });
  }

  if (done) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm text-text-main">{publisherName}</p>
        <p className="text-xs text-text-muted">{amountTon != null ? `${amountTon} TON` : "بدون مبلغ ثبت‌شده"}</p>
      </div>
      <div className="flex items-center gap-2">
        {showPaidInput && (
          <input
            type="number"
            step="any"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="مبلغ واقعی TON ارسالی"
            className="w-32 rounded-md border border-border bg-background px-2 py-1 text-xs text-text-main"
          />
        )}
        <button onClick={() => handleReview("APPROVED")} disabled={isPending} className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50">تایید</button>
        <button onClick={() => handleReview("PAID")} disabled={isPending} className="rounded-md bg-accent px-3 py-1 text-xs text-accent-foreground disabled:opacity-50">
          {showPaidInput ? "ثبت پرداخت" : "پرداخت شد"}
        </button>
        <button onClick={() => handleReview("REJECTED")} disabled={isPending} className="rounded-md border border-red-400 px-3 py-1 text-xs text-red-400 disabled:opacity-50">رد</button>
      </div>
    </div>
  );
}