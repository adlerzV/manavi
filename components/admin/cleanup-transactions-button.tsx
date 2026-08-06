"use client";

import { useState, type FormEvent } from "react";
import { cleanupOldFailedTransactions } from "@/app/admin/actions/transactions";

export function CleanupTransactionsButton() {
  const [days, setDays] = useState("30");
  const [status, setStatus] = useState<"idle" | "pending" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [deletedCount, setDeletedCount] = useState<number | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedDays = Number(days);
    if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
      setStatus("error");
      setError("عدد روز نامعتبر است");
      return;
    }
    if (!confirm(`تراکنش‌های ناموفق قدیمی‌تر از ${parsedDays} روز برای همیشه حذف می‌شوند. مطمئنید؟`)) return;

    setStatus("pending");
    setError(null);
    const result = await cleanupOldFailedTransactions(parsedDays);
    if (result.success) {
      setStatus("done");
      setDeletedCount(result.data?.deleted ?? 0);
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در پاکسازی");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface p-3">
      <label className="text-xs text-text-muted" htmlFor="cleanup-days">پاکسازی تراکنش‌های ناموفق قدیمی‌تر از</label>
      <input id="cleanup-days" type="number" min={1} value={days} onChange={(e) => setDays(e.target.value)} className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs text-text-main" />
      <span className="text-xs text-text-muted">روز</span>
      <button type="submit" disabled={status === "pending"} className="rounded-md border border-red-400 px-3 py-1.5 text-xs text-red-400 disabled:opacity-50">
        {status === "pending" ? "در حال پاکسازی…" : "پاکسازی"}
      </button>
      {status === "done" && deletedCount !== null && <span className="text-xs text-primary">{deletedCount.toLocaleString("fa-IR")} تراکنش حذف شد</span>}
      {status === "error" && error && <span className="text-xs text-red-400">{error}</span>}
    </form>
  );
}