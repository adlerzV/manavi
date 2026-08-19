"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, getPublisherContext } from "@/lib/auth";

export interface PublisherOverviewStats {
  publishedChapters: number;
  pendingChapters: number;
  totalDonationsUsdt: number;
}

export async function getPublisherOverviewStats(): Promise<PublisherOverviewStats | null> {
  const user = await getSessionUser();
  const context = await getPublisherContext(user);
  if (!user || !context) return null;

  const [publishedChapters, pendingChapters, donations] = await Promise.all([
    prisma.chapter.count({
      where: { status: "PUBLISHED", comic: { license: { publisherId: context.publisherId } } },
    }),
    prisma.chapter.count({
      where: { status: "PENDING_APPROVAL", comic: { license: { publisherId: context.publisherId } } },
    }),
    prisma.transaction.aggregate({
      where: { type: "DONATION", status: "PAID", currency: "USDT", receiverId: user.id },
      _sum: { amount: true },
    }),
  ]);

  return {
    publishedChapters,
    pendingChapters,
    totalDonationsUsdt: Number(donations._sum.amount ?? 0),
  };
}

export interface StaffOverviewStats {
  uploadedChapters: number;
  pendingChapters: number;
  totalDonationsUsdt: number;
}

export async function getStaffOverviewStats(): Promise<StaffOverviewStats | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const [uploadedChapters, pendingChapters, donations] = await Promise.all([
    prisma.chapter.count({ where: { uploadedById: user.id, status: "PUBLISHED" } }),
    prisma.chapter.count({ where: { uploadedById: user.id, status: "PENDING_APPROVAL" } }),
    prisma.transaction.aggregate({
      where: { type: "DONATION", status: "PAID", currency: "USDT", receiverId: user.id },
      _sum: { amount: true },
    }),
  ]);

  return {
    uploadedChapters,
    pendingChapters,
    totalDonationsUsdt: Number(donations._sum.amount ?? 0),
  };
}