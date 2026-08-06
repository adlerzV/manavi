import { getSessionUser } from "@/lib/auth";
import { getActiveSubscriptionPlans } from "@/lib/subscription-plans";
import { isZarinpalConfigured } from "@/lib/zarinpal";
import { SubscriptionPlans } from "@/components/shop/subscription-plans";
import { CoinPackages } from "@/components/shop/coin-packages";

export default async function ShopPage() {
  const [user, plans] = await Promise.all([getSessionUser(), getActiveSubscriptionPlans()]);
  const gatewayConfigured = isZarinpalConfigured();

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <div>
          <h1 className="text-lg font-medium text-text-main">فروشگاه</h1>
          <p className="mt-1 text-sm text-text-muted">
            موجودی سکه شما: {(user?.coinsBalance ?? 0).toLocaleString("fa-IR")}
          </p>
          {user?.subscriptionEnd && user.subscriptionEnd > new Date() && (
            <p className="text-sm text-primary">
              اشتراک ویژه تا {user.subscriptionEnd.toLocaleDateString("fa-IR")} فعال است
            </p>
          )}
        </div>

        {!gatewayConfigured && (
          <div className="rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
            درگاه پرداخت هنوز در تنظیمات محیطی پیکربندی نشده — خرید موقتاً غیرفعال است.
          </div>
        )}

        {plans.length > 0 ? (
          <section>
            <h2 className="mb-3 text-sm font-medium text-text-main">اشتراک ویژه</h2>
            <SubscriptionPlans plans={plans} authenticated={Boolean(user)} gatewayConfigured={gatewayConfigured} />
          </section>
        ) : (
          <section className="rounded-md border border-border bg-surface p-6 text-center">
            <p className="text-sm font-medium text-text-main">در حال حاضر همه محتوای مناوی رایگان است 🎉</p>
            <p className="mt-1 text-xs text-text-muted">اشتراک ویژه هنوز فعال نشده — به‌زودی امکانات بیشتری اضافه می‌شود.</p>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-sm font-medium text-text-main">خرید سکه</h2>
          <CoinPackages authenticated={Boolean(user)} gatewayConfigured={gatewayConfigured} />
        </section>
      </div>
    </main>
  );
}