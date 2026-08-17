import { getPublisherSettlementLog, listPayoutLog, listPendingOnChainPayouts } from "@/app/admin/actions/settlement";
import { PublisherSettlementLog } from "@/components/admin/publisher-settlement-log";
import { PayoutLogTable } from "@/components/admin/payout-log-table";
import { PendingOnChainPayouts } from "@/components/admin/pending-onchain-payouts";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function AdminPayoutsPage() {
  const [settlementRows, payoutLog, pendingOnChain] = await Promise.all([
    getPublisherSettlementLog(firstDayOfMonth(), today()),
    listPayoutLog(),
    listPendingOnChainPayouts(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-text-main">تسویه‌حساب ناشران</h1>
        <p className="mt-1 text-sm text-text-muted">
          سهم هر ناشر از سکه‌های خرج‌شده روی چپترهاش رو بر اساس درصد لایسنس محاسبه می‌کنه و با نرخ فعلی سکه به TON تبدیل می‌کنه. با «پرداخت خودکار با کیف پول من» مبلغ و مقصد از قبل پر می‌شن و شما فقط توی اپ کیف پولتون تایید می‌زنید — بدون نگهداری کلید خصوصی روی سرور. چون نرخ سکه به TON ممکنه تغییر کنه، عدد نمایش‌داده‌شده برای دوره‌های گذشته بر اساس نرخ فعلیه نه نرخ زمان تراکنش‌ها.
        </p>
      </div>

      <PublisherSettlementLog initialRows={settlementRows} />

      <PendingOnChainPayouts rows={pendingOnChain} />

      <div>
        <h2 className="mb-3 text-lg font-medium text-text-main">تاریخچه پرداخت‌ها</h2>
        <PayoutLogTable rows={payoutLog} />
      </div>
    </div>
  );
}