import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { requestPayment, isZarinpalConfigured } from "@/lib/zarinpal";
import { MIN_DONATION_TOMAN, MAX_DONATION_TOMAN } from "@/lib/billing";
import { checkRateLimit } from "@/lib/moderation";

export async function POST(req: NextRequest) {
  if (!isZarinpalConfigured()) {
    return NextResponse.json({ error: "درگاه پرداخت پیکربندی نشده است" }, { status: 503 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const allowed = await checkRateLimit(`donate:${user.id}`, 5);
  if (!allowed) {
    return NextResponse.json({ error: "تعداد درخواست‌ها بیش از حد مجاز است، کمی صبر کنید" }, { status: 429 });
  }

  const { receiverId, amountToman, message } = await req.json().catch(() => ({}));

  if (typeof receiverId !== "string" || !receiverId) {
    return NextResponse.json({ error: "Invalid recipient" }, { status: 400 });
  }
  if (receiverId === user.id) {
    return NextResponse.json({ error: "Cannot donate to yourself" }, { status: 400 });
  }
  const amount = Number(amountToman);
  if (!Number.isFinite(amount) || amount < MIN_DONATION_TOMAN || amount > MAX_DONATION_TOMAN) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const isEligibleReceiver = await prisma.user.findFirst({
    where: {
      id: receiverId,
      OR: [
        { staffRoles: { some: {} } },
        { chapterStaffRoles: { some: {} } },
        { publisherProfile: { isNot: null } },
      ],
    },
    select: { id: true },
  });
  if (!isEligibleReceiver) {
    return NextResponse.json({ error: "Recipient is not eligible for donations" }, { status: 400 });
  }

  const trimmedMessage = typeof message === "string" ? message.trim().slice(0, 300) : null;

  const transaction = await prisma.transaction.create({
    data: {
      type: "DONATION",
      status: "PENDING",
      amount,
      currency: "IRT",
      payerId: user.id,
      receiverId,
      message: trimmedMessage || null,
    },
  });

  try {
    const callbackUrl = `${process.env.NEXT_PUBLIC_MINI_APP_URL}/api/payments/verify?transactionId=${transaction.id}`;
    const { authority, paymentUrl } = await requestPayment({
      amountToman: amount,
      description: "حمایت مالی از تیم مناوی",
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