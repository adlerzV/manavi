import { prisma } from "./prisma";

const RATE_LIMIT_WINDOW_MS = 60_000;

export async function checkRateLimit(key: string, limit: number): Promise<boolean> {
  const now = new Date();
  const bucket = await prisma.rateLimitBucket.findUnique({ where: { key } });

  if (!bucket || now.getTime() - bucket.windowStart.getTime() > RATE_LIMIT_WINDOW_MS) {
    await prisma.rateLimitBucket.upsert({
      where: { key },
      update: { count: 1, windowStart: now },
      create: { key, count: 1, windowStart: now },
    });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  await prisma.rateLimitBucket.update({
    where: { key },
    data: { count: { increment: 1 } },
  });
  return true;
}