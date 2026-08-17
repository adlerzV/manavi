"use client";

import { useState, useTransition } from "react";
import { searchTransactions, type TransactionRow } from "@/app/admin/actions/transactions";
import type { TransactionType, TransactionStatus } from "@prisma/client";

const TYPES: TransactionType[] = ["DONATION", "COIN_PURCHASE", "CHAPTER_UNLOCK", "ADMIN_GRANT", "ADMIN_REVOKE", "PUBLISHER_PAYOUT"];
const STATUSES: TransactionStatus[] = ["PENDING", "PAID", "FAILED"];

const TYPE_LABELS: Record<TransactionType, string> = {
  SUBSCRIPTION: "اشتراک (قدیمی)",
  DONATION: "دونیت",
  COIN_PURCHASE: "خرید سکه",
  CHAPTER_UNLOCK: "باز کردن چپتر",
  ADMIN_GRANT: "اعطای دستی",
  ADMIN_REVOKE: "کسر دستی",
  PUBLISHER_PAYOUT: "تسویه‌حساب ناشر",
};

export function TransactionTable({ initial, initialTotal }: { initial: TransactionRow[]; initialTotal: number }) {
  const [rows, setRows] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [type, setType] = useState<TransactionType | "">("");
  const [status, setStatus] = useState<TransactionStatus | "">("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  function runSearch(nextPage = 1) {
    startTransition(async () => {
      const result = await searchTransactions({ type: type || undefined, status: status || undefined, page: nextPage });
      setRows(result.transactions);
      setTotal(result.total);
      setPage(nextPage);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as TransactionType | "")} className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main">
          <option value="">همه انواع</option>
          {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as TransactionStatus | "")} className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main">
          <option value="">همه وضعیت‌ها</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => runSearch(1)} disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">فیلتر</button>
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {rows.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm text-text-main">
                {TYPE_LABELS[t.type]} · {t.payer.username ? `@${t.payer.username}` : t.payer.firstName}
                {t.receiver && ` ← ${t.receiver.username ? `@${t.receiver.username}` : t.receiver.firstName}`}
              </p>
              <p className="text-xs text-text-muted">{new Date(t.createdAt).toLocaleString("fa-IR")}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-text-main">
              {t.amount.toLocaleString("fa-IR")} {t.currency === "COIN" ? "سکه" : "TON"}</p>
              <p className={`text-xs ${t.status === "PAID" ? "text-primary" : t.status === "FAILED" ? "text-red-400" : "text-text-muted"}`}>{t.status}</p>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">تراکنشی یافت نشد.</p>}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{total.toLocaleString("fa-IR")} تراکنش</span>
        <div className="flex gap-2">
          <button onClick={() => runSearch(page - 1)} disabled={page <= 1 || isPending} className="disabled:opacity-30">قبلی</button>
          <button onClick={() => runSearch(page + 1)} disabled={page * 25 >= total || isPending} className="disabled:opacity-30">بعدی</button>
        </div>
      </div>
    </div>
  );
}