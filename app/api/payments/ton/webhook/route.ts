import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settlePendingTonTransactions } from "@/lib/ton-settlement";

const WEBHOOK_SECRET = process.env.TONAPI_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const provided =
      req.headers.get("x-tonapi-webhook-secret") ??
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }


  await req.json().catch(() => null);

  const pending = await prisma.transaction.findMany({
    where: { status: "PENDING", currency: "TON", tonComment: { not: null } },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const result = await settlePendingTonTransactions(pending);

  return NextResponse.json({ ok: true, ...result });
}