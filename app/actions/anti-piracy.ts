"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const STRIKE_WINDOW_MS = 24 * 60 * 60 * 1000;
const STRIKE_THRESHOLD = 4;
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

  const since = new Date(Date.now() - STRIKE_WINDOW_MS);
  const strikeCount = await prisma.devToolsStrike.count({
    where: { userId: user.id, createdAt: { gte: since } },
  });

  if (strikeCount >= STRIKE_THRESHOLD) {
    await prisma.user.updateMany({
      where: { id: user.id, isBanned: false },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: "استفاده مکرر از ابزار توسعه‌دهنده مرورگر — احتمال برداشت غیرمجاز محتوا",
      },
    });
  }
}