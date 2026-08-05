"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, getPublisherContext } from "@/lib/auth";

export interface RoyaltySummary {
  licenseId: string;
  territory: string[];
  royaltyPercentage: number;
  grossCoinsRedeemed: number;
  publisherShareCoins: number;
}

export async function getRoyaltyDashboard(): Promise<{ summaries: RoyaltySummary[]; totalOwedCoins: number }> {
  const user = await getSessionUser();
  const context = await getPublisherContext(user);
  if (!context) {
    return { summaries: [], totalOwedCoins: 0 };
  }

  const licenses = await prisma.license.findMany({
    where: { publisherId: context.publisherId },
    include: { comics: { select: { id: true } } },
  });

  const periodStart = new Date();
  periodStart.setDate(1);
  periodStart.setHours(0, 0, 0, 0);
  const periodEnd = new Date();

  const allComicIds = licenses.flatMap((l) => l.comics.map((c) => c.id));

  const grouped = allComicIds.length
    ? await prisma.transaction.groupBy({
        by: ["comicId"],
        where: {
          comicId: { in: allComicIds },
          type: "CHAPTER_UNLOCK",
          status: "PAID",
          createdAt: { gte: periodStart, lte: periodEnd },
        },
        _sum: { amount: true },
      })
    : [];

  const coinsByComicId = new Map(
    grouped.map((g) => [g.comicId as string, Number(g._sum.amount ?? 0)])
  );

  const summaries: RoyaltySummary[] = [];
  let totalOwedCoins = 0;

  for (const license of licenses) {
    if (license.comics.length === 0) continue;

    const grossCoinsRedeemed = license.comics.reduce(
      (sum, c) => sum + (coinsByComicId.get(c.id) ?? 0),
      0
    );
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