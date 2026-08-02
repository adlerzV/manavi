import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requestPayment } from "@/lib/zarinpal";
import { findSubscriptionPlan } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { planId } = await req.json();
  const plan = findSubscriptionPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type: "SUBSCRIPTION",
      status: "PENDING",
      amount: plan.priceToman,
      currency: "IRT",
      payerId: user.id,
    },
  });

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_MINI_APP_URL}/api/payments/verify?transactionId=${transaction.id}&months=${plan.months}`;
    const { authority, paymentUrl } = await requestPayment({
      amountToman: plan.priceToman,
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