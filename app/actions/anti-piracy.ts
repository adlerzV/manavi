"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const MIN_STRIKE_INTERVAL_MS = 5 * 60 * 1000;

export async function reportDevToolsOpen(): Promise<void> {
  const user = await getSessionUser();
  if (!user || user.isBanned) return;

  const recent = await prisma.devToolsStrike.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < MIN_STRIKE_INTERVAL_MS) return;

  await prisma.devToolsStrike.create({ data: { userId: user.id } });
}