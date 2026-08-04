import { getRoyaltyDashboard } from "@/app/publisher/actions/royalty";

export async function RoyaltyDashboard() {
  const { summaries, totalOwedCoins } = await getRoyaltyDashboard();

  return (
    <div className="space-y-4">
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
    </div>
  );
}