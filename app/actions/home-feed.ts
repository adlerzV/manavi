"use server";

import { prisma } from "@/lib/prisma";
import { getAllowedAgeRatings } from "@/lib/content-filter";

export interface HomeFeedComic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  latestChapter: number | null;
}

export async function getHomeFeedComics(mode: "newest" | "popular", genreId?: string | null): Promise<HomeFeedComic[]> {
  const allowedRatings = await getAllowedAgeRatings();

  if (mode === "newest") {
    const rows = await prisma.chapter.findMany({
      where: {
        publishedAt: { not: null },
        comic: {
          ageRating: { in: allowedRatings },
          genres: genreId ? { some: { genreId } } : undefined,
        },
      },
      orderBy: { publishedAt: "desc" },
      distinct: ["comicId"],
      take: 18,
      select: { chapterNumber: true, comic: { select: { id: true, title: true, slug: true, coverImage: true } } },
    });
    return rows.map((r) => ({ ...r.comic, latestChapter: r.chapterNumber }));
  }

  const comics = await prisma.comic.findMany({
    where: {
      ageRating: { in: allowedRatings },
      genres: genreId ? { some: { genreId } } : undefined,
    },
    orderBy: { viewCount: "desc" },
    take: 18,
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      chapters: { where: { publishedAt: { not: null } }, orderBy: { chapterNumber: "desc" }, take: 1, select: { chapterNumber: true } },
    },
  });
  return comics.map((c) => ({ id: c.id, title: c.title, slug: c.slug, coverImage: c.coverImage, latestChapter: c.chapters[0]?.chapterNumber ?? null }));
}