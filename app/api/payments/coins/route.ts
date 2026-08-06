import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requestPayment, isZarinpalConfigured } from "@/lib/zarinpal";
import { findActiveCoinPackage } from "@/lib/coin-packages";
import { checkRateLimit } from "@/lib/moderation";

export async function POST(req: NextRequest) {
  if (!isZarinpalConfigured()) {
    return NextResponse.json({ error: "درگاه پرداخت پیکربندی نشده است" }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`coins:${user.id}`, 5);
  if (!allowed) {
    return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" }, { status: 429 });
  }

  const { packageId } = await req.json().catch(() => ({}));
  if (typeof packageId !== "string" || !packageId) {
    return NextResponse.json({ error: "Invalid package" }, { status: 400 });
  }

  const pack = await findActiveCoinPackage(packageId);
  if (!pack) {
    return NextResponse.json({ error: "این پکیج دیگر در دسترس نیست" }, { status: 400 });
  }

  const priceToman = Number(pack.priceToman);
  const totalCoins = pack.coins + pack.bonusCoins;

  const transaction = await prisma.transaction.create({
    data: {
      type: "COIN_PURCHASE",
      status: "PENDING",
      amount: priceToman,
      currency: "IRT",
      payerId: user.id,
      coinPackageId: pack.id,
    },
  });

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_MINI_APP_URL}/api/payments/verify?transactionId=${transaction.id}&coins=${totalCoins}`;
    const { authority, paymentUrl } = await requestPayment({
      amountToman: priceToman,
      description: `خرید ${totalCoins.toLocaleString("fa-IR")} سکه`,
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