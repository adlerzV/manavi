-- prisma/migrations/20260820100000_pricing_notices_cleanup/migration.sql

-- قیمت پکیج سکه همیشه از coins × PlatformSettings.coinPriceUsdt محاسبه می‌شود
ALTER TABLE "CoinPackage" DROP COLUMN "priceUsdt";
ALTER TABLE "CoinPackage" DROP COLUMN "originalPriceUsdt";

-- مقدار پاداش دعوت دوستان قابل تنظیم شد
ALTER TABLE "PlatformSettings" ADD COLUMN "referralRewardCoins" INTEGER NOT NULL DEFAULT 10;

-- حذف قابلیت تامبنیل چپتر (استفاده نمی‌شد)
ALTER TABLE "Chapter" DROP COLUMN "thumbnailImage";

-- اعلان سبک ادمین به‌جای پیام همگانی تلگرام
CREATE TABLE "AdminNotice" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminNotice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminNotice_expiresAt_idx" ON "AdminNotice"("expiresAt");