-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'PUBLISHER_PAYOUT';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "payoutPublisherId" TEXT;

-- AlterTable
ALTER TABLE "PayoutRequest" ADD COLUMN "tonTransactionId" TEXT;

-- CreateIndex
CREATE INDEX "Transaction_payoutPublisherId_idx" ON "Transaction"("payoutPublisherId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutRequest_tonTransactionId_key" ON "PayoutRequest"("tonTransactionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payoutPublisherId_fkey" FOREIGN KEY ("payoutPublisherId") REFERENCES "Publisher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRequest" ADD CONSTRAINT "PayoutRequest_tonTransactionId_fkey" FOREIGN KEY ("tonTransactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;