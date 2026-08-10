CREATE TABLE "DevToolsStrike" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevToolsStrike_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DevToolsStrike_userId_createdAt_idx" ON "DevToolsStrike"("userId", "createdAt");

ALTER TABLE "DevToolsStrike" ADD CONSTRAINT "DevToolsStrike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;