import { PrismaClient } from "@prisma/client";

// Standard Next.js pattern: reuse one PrismaClient across hot reloads in dev
// so you don't exhaust the connection pool. In production, make sure
// DATABASE_URL points at the pooled connection (PgBouncer, port 6543) and
// DIRECT_URL at the direct one, per datasource config in schema.prisma.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
