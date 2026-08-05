import { redirect } from "next/navigation";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PayoutRequestForm } from "@/components/publisher/payout-request-form";

export default async function PublisherPayoutsPage() {
  const user = await getSessionUser();
  const context = await getPublisherContext(user);

  if (!context) {
    if (user?.role !== "ADMIN") redirect("/publisher");
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
        حساب شما به هیچ ناشری متصل نیست.
      </div>
    );
  }
  if (!context.isOwner) {
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
        فقط ناشر اصلی می‌تواند درخواست تسویه‌حساب ثبت کند.
      </div>
    );
  }

  const payouts = await prisma.payoutRequest.findMany({
    where: { publisherId: context.publisherId },
    orderBy: { requestedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PayoutRequestForm />
      <div className="divide-y divide-border rounded-md border border-border">
        {payouts.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-4 py-3">
            <p className="text-sm text-text-main">{Number(p.amountToman).toLocaleString("fa-IR")} تومان</p>
            <p className="text-xs text-text-muted">{p.status}</p>
          </div>
        ))}
        {payouts.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">درخواستی ثبت نشده.</p>}
      </div>
    </div>
  );
}