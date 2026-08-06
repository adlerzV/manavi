import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requestPayment, isZarinpalConfigured } from "@/lib/zarinpal";
import { findActiveSubscriptionPlan } from "@/lib/subscription-plans";
import { checkRateLimit } from "@/lib/moderation";

export async function POST(req: NextRequest) {
  if (!isZarinpalConfigured()) {
    return NextResponse.json({ error: "درگاه پرداخت پیکربندی نشده است" }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`subscribe:${user.id}`, 5);
  if (!allowed) {
    return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" }, { status: 429 });
  }

  const { planId } = await req.json().catch(() => ({}));
  if (typeof planId !== "string" || !planId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = await findActiveSubscriptionPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "این پلن دیگر در دسترس نیست" }, { status: 400 });
  }

  const priceToman = Number(plan.priceToman);

  const transaction = await prisma.transaction.create({
    data: {
      type: "SUBSCRIPTION",
      status: "PENDING",
      amount: priceToman,
      currency: "IRT",
      payerId: user.id,
      subscriptionPlanId: plan.id,
    },
  });

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_MINI_APP_URL}/api/payments/verify?transactionId=${transaction.id}&months=${plan.months}`;
    const { authority, paymentUrl } = await requestPayment({
      amountToman: priceToman,
      description: `اشتراک ویژه ${plan.label}`,
      callbackUrl,
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { gatewayAuthority: authority },
    });

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment request failed" },
      { status: 502 }
    );
  }
}