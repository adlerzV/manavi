import "server-only";
import { prisma } from "./prisma";

export interface CoinPackageView {
  id: string;
  coins: number;
  bonusCoins: number;
  totalCoins: number;
  priceUsdt: number;
  originalPriceUsdt: number | null;
  badge: string | null;
  isFeatured: boolean;
}

export async function getActiveCoinPackages(): Promise<CoinPackageView[]> {
  const packages = await prisma.coinPackage.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { coins: "asc" }],
  });

  return packages.map((p) => ({
    id: p.id,
    coins: p.coins,
    bonusCoins: p.bonusCoins,
    totalCoins: p.coins + p.bonusCoins,
    priceUsdt: Number(p.priceUsdt),
    originalPriceUsdt: p.originalPriceUsdt ? Number(p.originalPriceUsdt) : null,
    badge: p.badge,
    isFeatured: p.isFeatured,
  }));
}

export async function findActiveCoinPackage(packageId: string) {
  return prisma.coinPackage.findFirst({ where: { id: packageId, isActive: true } });
}