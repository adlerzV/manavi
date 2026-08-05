// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import type { Transaction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyPayment } from "@/lib/zarinpal";

async function resultPath(transaction: Pick<Transaction, "type" | "receiverId"> | null): Promise<string> {
  if (transaction?.type === "DONATION" && transaction.receiverId) {
    const publisherProfile = await prisma.publisher.findUnique({
      where: { contractUserId: transaction.receiverId },
      select: { id: true },
    });
    if (publisherProfile) {
      return `/app/publisher/${publisherProfile.id}`;
    }
    return `/app/team/${transaction.receiverId}`;
  }
  return "/app/shop";
}

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

  const path = await resultPath(transaction);

  // Idempotency guard: Zarinpal (and a user refreshing the callback URL) can
  // hit this endpoint more than once for the same transaction. Once it's
  // already been settled, never re-run the crediting logic again.
  if (transaction.status === "PAID") {
    return NextResponse.redirect(`${redirectBase}${path}?payment=success`);
  }
  if (transaction.status === "FAILED") {
    return NextResponse.redirect(`${redirectBase}${path}?payment=error`);
  }

  if (status !== "OK") {
    await prisma.transaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return NextResponse.redirect(`${redirectBase}${path}?payment=cancelled`);
  }

  try {
    const result = await verifyPayment(authority, Number(transaction.amount));

    // Atomically flip PENDING -> PAID. If a concurrent/duplicate request
    // already did this, `count` will be 0 and we skip crediting again.
    const claimed = await prisma.transaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: { status: "PAID", gatewayRefId: result.refId },
    });

    if (claimed.count === 0) {
      return NextResponse.redirect(`${redirectBase}${path}?payment=success`);
    }

    await prisma.$transaction(async (tx) => {
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

    return NextResponse.redirect(`${redirectBase}${path}?payment=success`);
  } catch {
    await prisma.transaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: { status: "FAILED" },
    });
    return NextResponse.redirect(`${redirectBase}${path}?payment=error`);
  }
}