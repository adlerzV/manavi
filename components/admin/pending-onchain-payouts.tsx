import type { PendingOnChainPayoutRow } from "@/app/admin/actions/settlement";

export function PendingOnChainPayouts({ rows }: { rows: PendingOnChainPayoutRow[] }) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-accent">در انتظار تایید روی بلاکچین</h2>
      <div className="divide-y divide-border rounded-md border border-accent/40 bg-accent/5">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-text-main">{row.publisherName}</p>
            <div className="text-left">
              <p className="text-sm text-accent">{row.amountUsdt != null ? `${row.amountUsdt} USDT` : "—"}</p>
              <p className="text-xs text-text-muted">{new Date(row.requestedAt).toLocaleString("fa-IR")}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-text-muted">
        این تراکنش‌ها از کیف پول شما ارسال شده‌اند و به‌صورت خودکار (معمولاً تا چند دقیقه) روی بلاکچین تایید و به «تاریخچه پرداخت‌ها» منتقل می‌شوند.
      </p>
    </div>
  );
}