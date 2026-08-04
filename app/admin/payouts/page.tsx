import { prisma } from "@/lib/prisma";
import { PayoutReviewPanel } from "@/components/admin/payout-review-panel";

export default async function AdminPayoutsPage() {
  const payouts = await prisma.payoutRequest.findMany({
    where: { status: "PENDING" },
    orderBy: { requestedAt: "asc" },
    include: { publisher: { select: { name: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-text-main">درخواست‌های تسویه‌حساب</h1>
      <div className="divide-y divide-border rounded-md border border-border">
        {payouts.map((p) => (
          <PayoutReviewPanel key={p.id} payoutId={p.id} publisherName={p.publisher.name} amountToman={Number(p.amountToman)} />
        ))}
        {payouts.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">درخواستی در انتظار نیست.</p>}
      </div>
    </div>
  );
}