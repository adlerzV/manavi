"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/moderation";

const MAX_SEARCH_TERM_LENGTH = 100;

export async function recordSearchTerm(term: string): Promise<void> {
  const trimmed = term.trim().slice(0, MAX_SEARCH_TERM_LENGTH);
  if (!trimmed) return;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const allowed = await checkRateLimit(`search-term:${ip}`, 20);
  if (!allowed) return;

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