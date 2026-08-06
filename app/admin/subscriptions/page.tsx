import { listSubscriptionPlans } from "@/app/admin/actions/subscription-plans";
import { SubscriptionPlanManager } from "@/components/admin/subscription-plan-manager";

export default async function AdminSubscriptionsPage() {
  const plans = await listSubscriptionPlans();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-main">پلن‌های اشتراک</h1>
        <p className="mt-1 text-sm text-text-muted">
          تا وقتی پلنی فعال نکنید، فروشگاه به کاربران به‌صورت «همه محتوا رایگان است» نمایش داده می‌شود.
        </p>
      </div>
      <SubscriptionPlanManager initialPlans={plans} />
    </div>
  );
}