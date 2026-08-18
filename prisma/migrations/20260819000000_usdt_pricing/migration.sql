-- prisma/migrations/20260819000000_usdt_pricing/migration.sql

ALTER TABLE "CoinPackage" ADD COLUMN "priceUsdt" DECIMAL(12,2);
ALTER TABLE "CoinPackage" ADD COLUMN "originalPriceUsdt" DECIMAL(12,2);

-- بک‌فیل موقت — چون هنوز پیش از لانچ هستیم، بعد از این مایگریشن حتماً
-- برو /admin/coin-packages و قیمت‌های USDT واقعی رو دستی تنظیم کن.
UPDATE "CoinPackage" SET "priceUsdt" = COALESCE("priceTon", 1);
ALTER TABLE "CoinPackage" ALTER COLUMN "priceUsdt" SET NOT NULL;

ALTER TABLE "CoinPackage" DROP COLUMN "priceToman";
ALTER TABLE "CoinPackage" DROP COLUMN "priceTon";
ALTER TABLE "CoinPackage" DROP COLUMN "originalPriceToman";

ALTER TABLE "PlatformSettings" ADD COLUMN "coinPriceUsdt" DECIMAL(20,6) NOT NULL DEFAULT 0.002;
ALTER TABLE "PlatformSettings" ADD COLUMN "tomanPerUsdt" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "PlatformSettings" DROP COLUMN "coinPriceTon";