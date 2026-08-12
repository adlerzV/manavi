import "server-only";
import { unstable_cache } from "next/cache";
import type { AgeRating } from "@prisma/client";
import { prisma } from "./prisma";

export interface GenreOption {
  id: string;
  name: string;
  imageUrl: string | null;
}

const GENRES_REVALIDATE_SECONDS = 3600;

export const getAllGenres = unstable_cache(
  async (): Promise<GenreOption[]> => {
    return prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, imageUrl: true },
    });
  },
  ["genres:all"],
  { revalidate: GENRES_REVALIDATE_SECONDS, tags: ["genres"] }
);

export const getVisibleGenres = unstable_cache(
  async (allowedRatings: AgeRating[]): Promise<GenreOption[]> => {
    return prisma.genre.findMany({
      orderBy: { name: "asc" },
      where: { comics: { some: { comic: { ageRating: { in: allowedRatings } } } } },
      select: { id: true, name: true, imageUrl: true },
    });
  },
  ["genres:visible"],
  { revalidate: GENRES_REVALIDATE_SECONDS, tags: ["genres"] }
);
export interface PopularGenre extends GenreOption {
  comicCount: number;
}

export const getPopularGenres = unstable_cache(
  async (allowedRatings: AgeRating[], limit: number): Promise<PopularGenre[]> => {
    const genres = await prisma.genre.findMany({
      where: { comics: { some: { comic: { ageRating: { in: allowedRatings } } } } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        _count: { select: { comics: { where: { comic: { ageRating: { in: allowedRatings } } } } } },
      },
    });

    return genres
      .map((g) => ({ id: g.id, name: g.name, imageUrl: g.imageUrl, comicCount: g._count.comics }))
      .sort((a, b) => b.comicCount - a.comicCount)
      .slice(0, limit);
  },
  ["genres:popular"],
  { revalidate: GENRES_REVALIDATE_SECONDS, tags: ["genres"] }
);