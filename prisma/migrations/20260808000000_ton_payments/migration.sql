ALTER TABLE "SubscriptionPlan" ADD COLUMN "priceTon" DECIMAL(20,9);
ALTER TABLE "CoinPackage" ADD COLUMN "priceTon" DECIMAL(20,9);
ALTER TABLE "Transaction" ADD COLUMN "tonComment" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "tonTxHash" TEXT;
ALTER TABLE "Transaction" ALTER COLUMN "amount" TYPE DECIMAL(20,9);

CREATE UNIQUE INDEX "Transaction_tonComment_key" ON "Transaction"("tonComment");