import { getSessionUser } from "@/lib/auth";
import { SubscriptionPlans } from "@/components/shop/subscription-plans";
import { CoinPackages } from "@/components/shop/coin-packages";

export default async function ShopPage() {
  const user = await getSessionUser();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="text-lg font-medium text-text-main">فروشگاه</h1>
          <p className="mt-1 text-sm text-text-muted">
            موجودی سکه شما: {(user?.coinsBalance ?? 0).toLocaleString("fa-IR")}
          </p>
          {user?.subscriptionEnd && user.subscriptionEnd > new Date() && (
            <p className="text-sm text-text-muted">
              اشتراک ویژه تا {user.subscriptionEnd.toLocaleDateString("fa-IR")} فعال است
            </p>
          )}
        </div>

        <section>
          <h2 className="mb-3 text-sm font-medium text-text-main">اشتراک ویژه</h2>
          <SubscriptionPlans authenticated={Boolean(user)} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-medium text-text-main">خرید سکه</h2>
          <CoinPackages authenticated={Boolean(user)} />
        </section>
      </div>
    </main>
  );
}