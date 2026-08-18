"use server";

import { unstable_cache } from "next/cache";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAllowedAgeRatings } from "@/lib/content-filter";

export interface HomeFeedComic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  latestChapter: number | null;
  completed: boolean;
}

const HOME_FEED_LIST_REVALIDATE_SECONDS = 120;

const fetchHomeFeedComics = unstable_cache(
  async (mode: "newest" | "popular", allowedRatings: AgeRating[], genreId: string | null): Promise<HomeFeedComic[]> => {
    if (mode === "newest") {
      const rows = await prisma.chapter.findMany({
        where: {
          publishedAt: { not: null },
          comic: {
            ageRating: { in: allowedRatings },
            approvalStatus: "APPROVED",
            genres: genreId ? { some: { genreId } } : undefined,
          },
        },
        orderBy: { publishedAt: "desc" },
        distinct: ["comicId"],
        take: 18,
        select: {
          chapterNumber: true,
          comic: { select: { id: true, title: true, slug: true, coverImage: true, status: true } },
        },
      });
      return rows.map((r) => ({
        ...r.comic,
        latestChapter: r.chapterNumber,
        completed: r.comic.status === "COMPLETED",
      }));
    }

    const comics = await prisma.comic.findMany({
      where: {
        ageRating: { in: allowedRatings },
        approvalStatus: "APPROVED",
        genres: genreId ? { some: { genreId } } : undefined,
      },
      orderBy: { viewCount: "desc" },
      take: 18,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        status: true,
        chapters: {
          where: { publishedAt: { not: null } },
          orderBy: { chapterNumber: "desc" },
          take: 1,
          select: { chapterNumber: true },
        },
      },
    });

    return comics.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      coverImage: c.coverImage,
      latestChapter: c.chapters[0]?.chapterNumber ?? null,
      completed: c.status === "COMPLETED",
    }));
  },
  ["home-feed:list"],
  { revalidate: HOME_FEED_LIST_REVALIDATE_SECONDS, tags: ["home-feed"] }
);

export async function getHomeFeedComics(mode: "newest" | "popular", genreId?: string | null): Promise<HomeFeedComic[]> {
  const allowedRatings = await getAllowedAgeRatings();
  return fetchHomeFeedComics(mode, allowedRatings, genreId ?? null);
}