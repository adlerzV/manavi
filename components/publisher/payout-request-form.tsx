"use client";

import { useState, type FormEvent } from "react";
import { requestPayout } from "@/app/publisher/actions/payout";

export function PayoutRequestForm() {
  const [amount, setAmount] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await requestPayout({ amountTon: Number(amount), periodStart, periodEnd });

    if (result.success) {
      setStatus("done");
      setAmount("");
    } else {
      setStatus("error");
      setError(result.error ?? "خطا");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">درخواست تسویه‌حساب با TON</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="payout-amount">مبلغ (TON)</label>
          <input id="payout-amount" type="number" step="any" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="payout-start">شروع بازه</label>
          <input id="payout-start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="payout-end">پایان بازه</label>
          <input id="payout-end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <p className="text-xs text-text-muted">
        مبلغ رو بر اساس سکه‌های بازشده‌ی سهم خودتون در بخش «سهم این ماه» بالا تخمین بزنید. ادمین بعد از بررسی، مبلغ نهایی TON واریزی رو ثبت می‌کنه.
      </p>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">درخواست ثبت شد.</p>}

      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "در حال ثبت…" : "ثبت درخواست"}
      </button>
    </form>
  );
}