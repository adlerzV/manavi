-- CreateEnum
CREATE TYPE "ComicApprovalStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'NEEDS_CHANGES');

-- AlterTable
ALTER TABLE "Comic" ADD COLUMN "approvalStatus" "ComicApprovalStatus" NOT NULL DEFAULT 'APPROVED',
ADD COLUMN "createdById" TEXT,
ADD COLUMN "rejectionNote" TEXT;

-- CreateIndex
CREATE INDEX "Comic_approvalStatus_idx" ON "Comic"("approvalStatus");
CREATE INDEX "Comic_createdById_idx" ON "Comic"("createdById");

-- AddForeignKey
ALTER TABLE "Comic" ADD CONSTRAINT "Comic_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "PublisherStaff" ADD COLUMN "canManageComics" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Publisher" DROP COLUMN "donationCardNumber";