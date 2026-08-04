"use server";

import { prisma } from "@/lib/prisma";

export async function recordSearchTerm(term: string): Promise<void> {
  const trimmed = term.trim().slice(0, 100);
  if (!trimmed) return;

  await prisma.searchTerm
    .upsert({
      where: { term: trimmed },
      update: { count: { increment: 1 } },
      create: { term: trimmed, count: 1 },
    })
    .catch(() => {});
}

export interface TopSearchTerm {
  term: string;
  count: number;
}

export async function getTopSearchTerms(limit = 10): Promise<TopSearchTerm[]> {
  return prisma.searchTerm.findMany({
    orderBy: { count: "desc" },
    take: limit,
    select: { term: true, count: true },
  });
}