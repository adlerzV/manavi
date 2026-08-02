import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requestPayment } from "@/lib/zarinpal";
import { findCoinPackage } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { packageId } = await req.json();
  const pack = findCoinPackage(packageId);
  if (!pack) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type: "COIN_PURCHASE",
      status: "PENDING",
      amount: pack.priceToman,
      currency: "IRT",
      payerId: user.id,
    },
  });

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_MINI_APP_URL}/api/payments/verify?transactionId=${transaction.id}&coins=${pack.coins}`;
    const { authority, paymentUrl } = await requestPayment({
      amountToman: pack.priceToman,
      description: `خرید ${pack.coins} سکه`,
      callbackUrl,
    });

    await prisma.transaction.update({ where: { id: transaction.id }, data: { gatewayAuthority: authority } });

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment request failed" },
      { status: 502 }
    );
  }
}