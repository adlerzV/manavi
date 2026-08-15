-- AlterEnum
ALTER TYPE "ChapterStatus" ADD VALUE 'PENDING_APPROVAL';

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PublisherStaff" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN "uploadedById" TEXT;

-- AlterTable
ALTER TABLE "PayoutRequest" ALTER COLUMN "amountToman" DROP NOT NULL;
ALTER TABLE "PayoutRequest" ADD COLUMN "amountTon" DECIMAL(20,9);
ALTER TABLE "PayoutRequest" ADD COLUMN "paidAmountTon" DECIMAL(20,9);

-- CreateIndex
CREATE INDEX "Publisher_isVerified_idx" ON "Publisher"("isVerified");

-- CreateIndex
CREATE INDEX "Chapter_uploadedById_idx" ON "Chapter"("uploadedById");

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;