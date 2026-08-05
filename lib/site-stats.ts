import "server-only";
import { prisma } from "./prisma";

export interface SiteStats {
  readerCount: number;
  comicCount: number;
  totalDonationsToman: number;
}

export async function getSiteStats(): Promise<SiteStats> {
  const [readerCount, comicCount, donationAgg] = await Promise.all([
    prisma.user.count(),
    prisma.comic.count({
      where: { chapters: { some: { publishedAt: { not: null } } } },
    }),
    prisma.transaction.aggregate({
      where: { type: "DONATION", status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return {
    readerCount,
    comicCount,
    totalDonationsToman: Number(donationAgg._sum.amount ?? 0),
  };
}