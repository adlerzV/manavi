import { getRoyaltyDashboard } from "@/app/publisher/actions/royalty";
import { getPublisherOverviewStats } from "@/app/publisher/actions/overview";

export async function RoyaltyDashboard() {
  const [{ summaries, totalOwedCoins }, stats] = await Promise.all([
    getRoyaltyDashboard(),
    getPublisherOverviewStats(),
  ]);

  return (
    <div className="space-y-4">
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-primary">{stats.publishedChapters.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-text-muted">چپتر منتشرشده</p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-accent">{stats.pendingChapters.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-text-muted">در انتظار تایید</p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-primary">{stats.totalDonationsUsdt} USDT</p>
            <p className="mt-1 text-xs text-text-muted">دونیت دریافتی</p>
          </div>
        </div>
      )}

      <div className="rounded-md border border-border bg-surface p-4 text-center">
        <p className="text-2xl font-semibold text-primary">{totalOwedCoins.toLocaleString("fa-IR")}</p>
        <p className="mt-1 text-xs text-text-muted">سهم این ماه (سکه)</p>
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {summaries.map((s) => (
          <div key={s.licenseId} className="px-4 py-3">
            <p className="text-sm text-text-main">{s.territory.join("/")}</p>
            <p className="text-xs text-text-muted">
              درصد رویالتی: {s.royaltyPercentage}% · سکه بازشده: {s.grossCoinsRedeemed.toLocaleString("fa-IR")} · سهم: {s.publisherShareCoins.toLocaleString("fa-IR")}
            </p>
          </div>
        ))}
        {summaries.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">داده‌ای موجود نیست.</p>}
      </div>

      <p className="rounded-md border border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        تسویه‌حساب به‌صورت ماهانه و دستی توسط مدیریت انجام می‌شه — نیازی به درخواست از طرف شما نیست.
      </p>
    </div>
  );
}