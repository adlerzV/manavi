"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { getCoinPriceUsdt } from "@/lib/platform-settings";
import { safeError } from "@/lib/errors";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface PublisherSettlementRow {
  publisherId: string;
  publisherName: string;
  cryptoWalletAddress: string | null;
  grossCoinsRedeemed: number;
  weightedRoyaltyPercentage: number;
  owedCoins: number;
  owedUsdt: number;
}

export async function getPublisherSettlementLog(periodStart: string, periodEnd: string): Promise<PublisherSettlementRow[]> {
  await requireAdmin();

  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const coinPriceUsdt = await getCoinPriceUsdt();

  const licenses = await prisma.license.findMany({
    select: {
      id: true,
      royaltyPercentage: true,
      publisher: { select: { id: true, name: true, cryptoWalletAddress: true } },
      comics: { select: { id: true } },
    },
  });

  const allComicIds = licenses.flatMap((l) => l.comics.map((c) => c.id));
  const grouped = allComicIds.length
    ? await prisma.transaction.groupBy({
        by: ["comicId"],
        where: {
          comicId: { in: allComicIds },
          type: "CHAPTER_UNLOCK",
          status: "PAID",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
      })
    : [];

  const coinsByComicId = new Map(grouped.map((g) => [g.comicId as string, Number(g._sum.amount ?? 0)]));

  const byPublisher = new Map<string, PublisherSettlementRow>();

  for (const license of licenses) {
    const grossCoinsRedeemed = license.comics.reduce((sum, c) => sum + (coinsByComicId.get(c.id) ?? 0), 0);
    if (grossCoinsRedeemed === 0) continue;

    const owedCoins = (grossCoinsRedeemed * Number(license.royaltyPercentage)) / 100;

    const existing = byPublisher.get(license.publisher.id);
    if (existing) {
      existing.grossCoinsRedeemed += grossCoinsRedeemed;
      existing.owedCoins += owedCoins;
    } else {
      byPublisher.set(license.publisher.id, {
        publisherId: license.publisher.id,
        publisherName: license.publisher.name,
        cryptoWalletAddress: license.publisher.cryptoWalletAddress,
        grossCoinsRedeemed,
        weightedRoyaltyPercentage: Number(license.royaltyPercentage),
        owedCoins,
        owedUsdt: 0,
      });
    }
  }

  const rows = [...byPublisher.values()].map((row) => ({
    ...row,
    weightedRoyaltyPercentage:
      row.grossCoinsRedeemed > 0 ? Math.round((row.owedCoins / row.grossCoinsRedeemed) * 10000) / 100 : row.weightedRoyaltyPercentage,
    owedUsdt: Math.round(row.owedCoins * coinPriceUsdt * 1e6) / 1e6,
  }));

  return rows.sort((a, b) => b.owedUsdt - a.owedUsdt);
}

export async function recordManualPayout(input: {
  publisherId: string;
  amountUsdt: number;
  note?: string;
}): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    if (!Number.isFinite(input.amountUsdt) || input.amountUsdt <= 0) {
      return { success: false, error: "مبلغ باید مثبت باشد" };
    }

    const now = new Date();
    await prisma.payoutRequest.create({
      data: {
        publisherId: input.publisherId,
        amountTon: input.amountUsdt,
        paidAmountTon: input.amountUsdt,
        periodStart: now,
        periodEnd: now,
        status: "PAID",
        reviewedById: admin.id,
        reviewedAt: now,
        paidAt: now,
        reviewNote: input.note?.trim() || null,
      },
    });

    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export interface PayoutLogRow {
  id: string;
  publisherName: string;
  paidAmountUsdt: number | null;
  paidAt: string | null;
  reviewNote: string | null;
}

export async function listPayoutLog(): Promise<PayoutLogRow[]> {
  await requireAdmin();
  const rows = await prisma.payoutRequest.findMany({
    where: { status: "PAID" },
    orderBy: { paidAt: "desc" },
    take: 100,
    include: { publisher: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    publisherName: r.publisher.name,
    paidAmountUsdt: r.paidAmountTon != null ? Number(r.paidAmountTon) : null,
    paidAt: r.paidAt ? r.paidAt.toISOString() : null,
    reviewNote: r.reviewNote,
  }));
}

export interface PendingOnChainPayoutRow {
  id: string;
  publisherName: string;
  amountUsdt: number | null;
  requestedAt: string;
}

export async function listPendingOnChainPayouts(): Promise<PendingOnChainPayoutRow[]> {
  await requireAdmin();
  const rows = await prisma.payoutRequest.findMany({
    where: { status: "PENDING", tonTransactionId: { not: null } },
    orderBy: { requestedAt: "desc" },
    include: { publisher: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    publisherName: r.publisher.name,
    amountUsdt: r.amountTon != null ? Number(r.amountTon) : null,
    requestedAt: r.requestedAt.toISOString(),
  }));
}