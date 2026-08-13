// lib/prisma.ts
import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const looksLikeLocalDb = /localhost|127\.0\.0\.1/.test(DATABASE_URL);
if (process.env.NODE_ENV === "production" && !looksLikeLocalDb && !DATABASE_URL.includes("pgbouncer=true")) {
  console.warn(
    "[prisma] DATABASE_URL فاقد pgbouncer=true است. اگر این آدرس از طریق یک connection pooler در transaction mode عبور می‌کند، این پارامتر را اضافه کنید."
  );
}

const adapter = new PrismaPg({
  connectionString: DATABASE_URL,
  max: Number(process.env.DATABASE_POOL_MAX ?? 3),
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}