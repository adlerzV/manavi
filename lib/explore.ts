import "server-only";
import { getAllowedAgeRatings } from "./content-filter";
import { getCategoryBySlug } from "./categories";
import type { ComicStatus, Prisma } from "@prisma/client";

export interface ExploreFilters {
  q?: string;
  categorySlug?: string;
  genreIds?: string[];
  status?: ComicStatus;
}

export async function resolveExploreWhere(filters: ExploreFilters): Promise<Prisma.ComicWhereInput> {
  const allowedRatings = await getAllowedAgeRatings();
  const category = filters.categorySlug ? await getCategoryBySlug(filters.categorySlug) : null;
  const trimmedQuery = filters.q?.trim();

  return {
    ageRating: { in: allowedRatings },
    ...(trimmedQuery ? { title: { contains: trimmedQuery, mode: "insensitive" as const } } : {}),
    ...(category ? { categoryId: category.id } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.genreIds?.length ? { genres: { some: { genreId: { in: filters.genreIds } } } } : {}),
  };
}