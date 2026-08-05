-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cryptoWalletLabel" TEXT,
ADD COLUMN     "cryptoWalletAddress" TEXT,
ADD COLUMN     "customLinks" JSONB;

-- AlterTable
ALTER TABLE "Publisher" ADD COLUMN     "cryptoWalletLabel" TEXT,
ADD COLUMN     "cryptoWalletAddress" TEXT,
ADD COLUMN     "customLinks" JSONB;