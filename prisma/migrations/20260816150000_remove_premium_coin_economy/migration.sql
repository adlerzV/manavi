-- AlterEnum ChapterAccessType: drop SUBSCRIPTION and COIN_OR_SUBSCRIPTION, paid chapters collapse to COIN
BEGIN;
CREATE TYPE "ChapterAccessType_new" AS ENUM ('FREE', 'COIN');
ALTER TABLE "Chapter" ALTER COLUMN "accessType" DROP DEFAULT;
ALTER TABLE "Chapter" ALTER COLUMN "accessType" TYPE "ChapterAccessType_new" USING (
  CASE
    WHEN "accessType"::text IN ('SUBSCRIPTION', 'COIN_OR_SUBSCRIPTION') THEN 'COIN'
    ELSE "accessType"::text
  END
)::"ChapterAccessType_new";
ALTER TYPE "ChapterAccessType" RENAME TO "ChapterAccessType_old";
ALTER TYPE "ChapterAccessType_new" RENAME TO "ChapterAccessType";
DROP TYPE "ChapterAccessType_old";
ALTER TABLE "Chapter" ALTER COLUMN "accessType" SET DEFAULT 'FREE';
COMMIT;

-- Drop SubscriptionPlan entirely
ALTER TABLE "Transaction" DROP CONSTRAINT IF EXISTS "Transaction_subscriptionPlanId_fkey";
DROP INDEX IF EXISTS "Transaction_subscriptionPlanId_idx";
ALTER TABLE "Transaction" DROP COLUMN IF EXISTS "subscriptionPlanId";
DROP TABLE IF EXISTS "SubscriptionPlan";

-- Drop subscription fields from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "isSubscribed";
ALTER TABLE "User" DROP COLUMN IF EXISTS "subscriptionEnd";

-- Custom coin purchase support
ALTER TABLE "Transaction" ADD COLUMN "customCoins" INTEGER;

-- Global coin value in TON (custom purchases + publisher settlement conversion)
ALTER TABLE "PlatformSettings" ADD COLUMN "coinPriceTon" DECIMAL(20,9) NOT NULL DEFAULT 0.01;