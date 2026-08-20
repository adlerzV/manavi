import "server-only";
import { prisma } from "./prisma";
import { getCoinPriceUsdt } from "./platform-settings";

export interface CoinPackageView {
  id: string;
  coins: number;
  bonusCoins: number;
  totalCoins: number;
  priceUsdt: number;
  badge: string | null;
  isFeatured: boolean;
}

export async function getActiveCoinPackages(): Promise<CoinPackageView[]> {
  const [packages, coinPriceUsdt] = await Promise.all([
    prisma.coinPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { coins: "asc" }],
    }),
    getCoinPriceUsdt(),
  ]);

  return packages.map((p) => ({
    id: p.id,
    coins: p.coins,
    bonusCoins: p.bonusCoins,
    totalCoins: p.coins + p.bonusCoins,
    priceUsdt: Math.round(p.coins * coinPriceUsdt * 1e6) / 1e6,
    badge: p.badge,
    isFeatured: p.isFeatured,
  }));
}

export async function findActiveCoinPackage(packageId: string) {
  const [pack, coinPriceUsdt] = await Promise.all([
    prisma.coinPackage.findFirst({ where: { id: packageId, isActive: true } }),
    getCoinPriceUsdt(),
  ]);
  if (!pack) return null;
  return { ...pack, priceUsdt: Math.round(pack.coins * coinPriceUsdt * 1e6) / 1e6 };
}