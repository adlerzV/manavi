"use server";

import { prisma } from "@/lib/prisma";
import { resolveExploreWhere, type ExploreFilters } from "@/lib/explore";

export async function getExploreResultsCount(filters: ExploreFilters): Promise<number> {
  const where = await resolveExploreWhere(filters);
  return prisma.comic.count({ where });
}