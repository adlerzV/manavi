import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zarinpal";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");
  const transactionId = url.searchParams.get("transactionId");
  const months = url.searchParams.get("months");
  const coins = url.searchParams.get("coins");

  const redirectBase = process.env.NEXT_PUBLIC_MINI_APP_URL ?? "";

  if (!authority || !transactionId) {
    return NextResponse.redirect(`${redirectBase}/app/shop?payment=error`);
  }

  const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
  if (!transaction || transaction.gatewayAuthority !== authority) {
    return NextResponse.redirect(`${redirectBase}/app/shop?payment=error`);
  }

  if (status !== "OK") {
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${redirectBase}/app/shop?payment=cancelled`);
  }

  try {
    const result = await verifyPayment(authority, Number(transaction.amount));

    await prisma.$transaction(async (tx) => {
      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: "PAID", gatewayRefId: result.refId },
      });

      if (months) {
        const user = await tx.user.findUnique({ where: { id: transaction.payerId } });
        const base = user?.subscriptionEnd && user.subscriptionEnd > new Date() ? user.subscriptionEnd : new Date();
        const newEnd = new Date(base);
        newEnd.setMonth(newEnd.getMonth() + Number(months));

        await tx.user.update({
          where: { id: transaction.payerId },
          data: { isSubscribed: true, subscriptionEnd: newEnd },
        });
      }

      if (coins) {
        await tx.user.update({
          where: { id: transaction.payerId },
          data: { coinsBalance: { increment: Number(coins) } },
        });
      }
    });

    return NextResponse.redirect(`${redirectBase}/app/shop?payment=success`);
  } catch {
    await prisma.transaction.update({ where: { id: transaction.id }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${redirectBase}/app/shop?payment=error`);
  }
}