"use client";

import { useState, useTransition } from "react";
import { reviewPayout } from "@/app/admin/actions/payouts";

export function PayoutReviewPanel({ payoutId, publisherName, amountToman }: { payoutId: string; publisherName: string; amountToman: number }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleReview(decision: "APPROVED" | "REJECTED" | "PAID") {
    startTransition(async () => {
      const result = await reviewPayout(payoutId, decision);
      if (result.success) setDone(true);
    });
  }

  if (done) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="text-sm text-text-main">{publisherName}</p>
        <p className="text-xs text-text-muted">{amountToman.toLocaleString("fa-IR")} تومان</p>
      </div>
      <div className="flex gap-2">
        <button onClick={() => handleReview("APPROVED")} disabled={isPending} className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50">تایید</button>
        <button onClick={() => handleReview("PAID")} disabled={isPending} className="rounded-md bg-accent px-3 py-1 text-xs text-accent-foreground disabled:opacity-50">پرداخت شد</button>
        <button onClick={() => handleReview("REJECTED")} disabled={isPending} className="rounded-md border border-red-400 px-3 py-1 text-xs text-red-400 disabled:opacity-50">رد</button>
      </div>
    </div>
  );
}