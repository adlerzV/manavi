import type { PayoutLogRow } from "@/app/admin/actions/settlement";

export function PayoutLogTable({ rows }: { rows: PayoutLogRow[] }) {
  return (
    <div className="divide-y divide-border rounded-md border border-border">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm text-text-main">{row.publisherName}</p>
            {row.reviewNote && <p className="text-xs text-text-muted">{row.reviewNote}</p>}
          </div>
          <div className="text-left">
            <p className="text-sm text-primary">{row.paidAmountTon != null ? `${row.paidAmountTon} TON` : "—"}</p>
            <p className="text-xs text-text-muted">{row.paidAt ? new Date(row.paidAt).toLocaleDateString("fa-IR") : ""}</p>
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز پرداختی ثبت نشده.</p>}
    </div>
  );
}