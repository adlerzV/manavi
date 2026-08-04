"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export interface RoyaltySummary {
  licenseId: string;
  territory: string[];
  royaltyPercentage: number;
  grossCoinsRedeemed: number;
  publisherShareCoins: number;
}

export async function getRoyaltyDashboard(): Promise<{ summaries: RoyaltySummary[]; totalOwedCoins: number }> {
  const user = await getSessionUser();
  if (!user?.publisherProfile) {
    return { summaries: [], totalOwedCoins: 0 };
  }

  const licenses = await prisma.license.findMany({
    where: { publisherId: user.publisherProfile.id },
    include: { comics: { select: { id: true } } },
  });

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date();

  const summaries: RoyaltySummary[] = [];
  let totalOwedCoins = 0;

  for (const license of licenses) {
    const comicIds = license.comics.map((c) => c.id);
    if (comicIds.length === 0) continue;

    const agg = await prisma.transaction.aggregate({
      where: { comicId: { in: comicIds }, type: "CHAPTER_UNLOCK", status: "PAID", createdAt: { gte: periodStart, lte: periodEnd } },
      _sum: { amount: true },
    });

    const grossCoinsRedeemed = Number(agg._sum.amount ?? 0);
    const publisherShareCoins = (grossCoinsRedeemed * Number(license.royaltyPercentage)) / 100;
    totalOwedCoins += publisherShareCoins;

    summaries.push({
      licenseId: license.id,
      territory: license.territory,
      royaltyPercentage: Number(license.royaltyPercentage),
      grossCoinsRedeemed,
      publisherShareCoins,
    });
  }

  return { summaries, totalOwedCoins };
}