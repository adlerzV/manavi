"use client";

import { useState, useTransition } from "react";
import { searchAuditLogAction } from "@/app/admin/actions/audit-log";
import type { AuditLogRow } from "@/lib/audit-log";

export function AuditLogTable({ initial, initialTotal }: { initial: AuditLogRow[]; initialTotal: number }) {
  const [rows, setRows] = useState(initial);
  const [total, setTotal] = useState(initialTotal);
  const [action, setAction] = useState("");
  const [targetType, setTargetType] = useState("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  function runSearch(nextPage = 1) {
    startTransition(async () => {
      const result = await searchAuditLogAction({ action: action || undefined, targetType: targetType || undefined, page: nextPage });
      setRows(result.logs);
      setTotal(result.total);
      setPage(nextPage);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="فیلتر اکشن (مثلاً comic.approve)" className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        <input value={targetType} onChange={(e) => setTargetType(e.target.value)} placeholder="نوع هدف (مثلاً Comic)" className="w-40 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        <button onClick={() => runSearch(1)} disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          جستجو
        </button>
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {rows.map((log) => (
          <div key={log.id} className="space-y-1 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-text-main">{log.action}</span>
              <span className="text-xs text-text-muted">{new Date(log.createdAt).toLocaleString("fa-IR")}</span>
            </div>
            <p className="text-xs text-text-muted">
              فاعل: {log.actorId} ({log.actorRole})
              {log.targetType && ` · هدف: ${log.targetType}${log.targetId ? ` #${log.targetId.slice(0, 8)}` : ""}`}
            </p>
            {log.metadata != null && (
              <pre className="overflow-x-auto rounded bg-background p-2 text-[10px] text-text-muted" dir="ltr">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            )}
          </div>
        ))}
        {rows.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">لاگی یافت نشد.</p>}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{total.toLocaleString("fa-IR")} رکورد</span>
        <div className="flex gap-2">
          <button onClick={() => runSearch(page - 1)} disabled={page <= 1 || isPending} className="disabled:opacity-30">قبلی</button>
          <button onClick={() => runSearch(page + 1)} disabled={page * 50 >= total || isPending} className="disabled:opacity-30">بعدی</button>
        </div>
      </div>
    </div>
  );
}