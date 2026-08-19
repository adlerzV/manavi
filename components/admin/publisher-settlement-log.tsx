"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getPublisherSettlementLog,
  recordManualPayout,
  type PublisherSettlementRow,
} from "@/app/admin/actions/settlement";
import { PublisherPayoutButton } from "./publisher-payout-button";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function PublisherSettlementLog({ initialRows }: { initialRows: PublisherSettlementRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [periodStart, setPeriodStart] = useState(firstDayOfMonth());
  const [periodEnd, setPeriodEnd] = useState(today());
  const [isPending, startTransition] = useTransition();
  const [manualFor, setManualFor] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function runSearch() {
    startTransition(async () => {
      const result = await getPublisherSettlementLog(periodStart, periodEnd);
      setRows(result);
    });
  }

  function handlePaid() {
    runSearch();
    router.refresh();
  }

  function openManual(row: PublisherSettlementRow) {
    setManualFor(row.publisherId);
    setAmountInput(String(row.owedUsdt));
    setNoteInput("");
    setError(null);
  }

  function handleManualRecord(publisherId: string) {
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("مبلغ نامعتبر است");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await recordManualPayout({ publisherId, amountUsdt: amount, note: noteInput });
      if (result.success) {
        setManualFor(null);
        handlePaid();
      } else {
        setError(result.error ?? "خطا در ثبت");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-xs text-text-muted" htmlFor="settlement-start">از تاریخ</label>
          <input id="settlement-start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-text-muted" htmlFor="settlement-end">تا تاریخ</label>
          <input id="settlement-end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main" />
        </div>
        <button onClick={runSearch} disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          محاسبه
        </button>
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {rows.map((row) => (
          <div key={row.publisherId} className="space-y-3 px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-text-main">{row.publisherName}</p>
                <p className="text-xs text-text-muted">
                  {row.grossCoinsRedeemed.toLocaleString("fa-IR")} سکه بازشده · سهم {row.weightedRoyaltyPercentage}% ·{" "}
                  <span className="text-primary">{row.owedCoins.toLocaleString("fa-IR")} سکه ≈ {row.owedUsdt} USDT</span>
                </p>
                {row.cryptoWalletAddress ? (
                  <p className="mt-1 text-[11px] text-text-muted">کیف پول: {row.cryptoWalletAddress}</p>
                ) : (
                  <p className="mt-1 text-[11px] text-red-400">کیف پول TON ثبت نشده</p>
                )}
              </div>
              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                <PublisherPayoutButton
                  publisherId={row.publisherId}
                  publisherName={row.publisherName}
                  suggestedAmountUsdt={row.owedUsdt}
                  hasWallet={Boolean(row.cryptoWalletAddress)}
                  periodStart={periodStart}
                  periodEnd={periodEnd}
                  onPaid={handlePaid}
                />
                <button onClick={() => openManual(row)} className="rounded-md border border-border px-3 py-1.5 text-xs text-text-muted">
                  ثبت پرداخت دستی
                </button>
              </div>
            </div>

            {manualFor === row.publisherId && (
              <div className="flex flex-wrap items-center gap-2 rounded-md bg-background p-2">
                <input
                  type="number"
                  step="any"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="مبلغ USDT واقعی ارسالی"
                  className="w-40 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main"
                />
                <input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="یادداشت (اختیاری، مثلاً هش تراکنش)"
                  className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main"
                />
                <button onClick={() => handleManualRecord(row.publisherId)} disabled={isPending} className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50">
                  ثبت
                </button>
                <button onClick={() => setManualFor(null)} className="text-xs text-text-muted">انصراف</button>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">در این بازه سکه‌ای خرج نشده است.</p>}
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}