import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const NOTICES_TAG = "notices";

async function fetchActiveNotice() {
  return prisma.adminNotice.findFirst({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, message: true, createdAt: true },
  });
}

export const getActiveNotice = unstable_cache(fetchActiveNotice, ["notices:active"], {
  revalidate: 60,
  tags: [NOTICES_TAG],
});