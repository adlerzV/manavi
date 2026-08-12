import "server-only";
import { unstable_cache } from "next/cache";
import type { ReadingMode, ReadingDirection } from "@prisma/client";
import { prisma } from "./prisma";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  readingDirection: ReadingDirection;
  defaultReadingMode: ReadingMode;
}

const CATEGORIES_REVALIDATE_SECONDS = 3600;

export const getAllCategories = unstable_cache(
  async (): Promise<CategoryOption[]> => {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, imageUrl: true, readingDirection: true, defaultReadingMode: true },
    });
  },
  ["categories:all"],
  { revalidate: CATEGORIES_REVALIDATE_SECONDS, tags: ["categories"] }
);

export const getHomepageCategories = unstable_cache(
  async (): Promise<CategoryOption[]> => {
    return prisma.category.findMany({
      where: { isActive: true, showOnHomepage: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, imageUrl: true, readingDirection: true, defaultReadingMode: true },
    });
  },
  ["categories:homepage"],
  { revalidate: CATEGORIES_REVALIDATE_SECONDS, tags: ["categories"] }
);

export const getCategoryBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.category.findFirst({ where: { slug, isActive: true } });
  },
  ["categories:by-slug"],
  { revalidate: CATEGORIES_REVALIDATE_SECONDS, tags: ["categories"] }
);