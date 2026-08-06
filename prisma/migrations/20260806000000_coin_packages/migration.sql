-- CreateTable
CREATE TABLE "CoinPackage" (
    "id" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "bonusCoins" INTEGER NOT NULL DEFAULT 0,
    "priceToman" DECIMAL(12,2) NOT NULL,
    "originalPriceToman" DECIMAL(12,2),
    "badge" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoinPackage_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "coinPackageId" TEXT;

-- CreateIndex
CREATE INDEX "CoinPackage_isActive_sortOrder_idx" ON "CoinPackage"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "Transaction_coinPackageId_idx" ON "Transaction"("coinPackageId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_coinPackageId_fkey" FOREIGN KEY ("coinPackageId") REFERENCES "CoinPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;