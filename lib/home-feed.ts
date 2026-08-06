import "server-only";
import type { AgeRating } from "@prisma/client";
import { prisma } from "./prisma";

export interface HeroComic {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  dominantColor: string | null;
  featuredBadge: string | null;
}

export async function getHeroComics(allowedRatings: AgeRating[]): Promise<HeroComic[]> {
  const featured = await prisma.comic.findMany({
    where: { ageRating: { in: allowedRatings }, isFeaturedOnHome: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: { id: true, title: true, slug: true, description: true, coverImage: true, dominantColor: true, featuredBadge: true },
  });

  if (featured.length > 0) {
    return [...featured].sort(() => Math.random() - 0.5);
  }

  const fallback = await prisma.comic.findFirst({
    where: { ageRating: { in: allowedRatings } },
    orderBy: { bookmarks: { _count: "desc" } },
    select: { id: true, title: true, slug: true, description: true, coverImage: true, dominantColor: true, featuredBadge: true },
  });

  return fallback ? [fallback] : [];
}

export interface RecommendedComic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  latestChapter: number | null;
}

export async function getGenreBasedRecommendations(userId: string, allowedRatings: AgeRating[]): Promise<RecommendedComic[]> {
  const viewedGenres = await prisma.readHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: { comic: { select: { id: true, genres: { select: { genreId: true } } } } },
  });

  const genreCounts = new Map<string, number>();
  const viewedComicIds = new Set<string>();
  for (const entry of viewedGenres) {
    viewedComicIds.add(entry.comic.id);
    for (const g of entry.comic.genres) {
      genreCounts.set(g.genreId, (genreCounts.get(g.genreId) ?? 0) + 1);
    }
  }

  if (genreCounts.size === 0) return [];

  const topGenreId = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0][0];

  const comics = await prisma.comic.findMany({
    where: {
      id: { notIn: [...viewedComicIds] },
      ageRating: { in: allowedRatings },
      genres: { some: { genreId: topGenreId } },
    },
    orderBy: { viewCount: "desc" },
    take: 10,
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

export interface LatestCommentItem {
  id: string;
  content: string;
  createdAt: string;
  chapterId: string;
  chapterNumber: number;
  comic: { title: string; slug: string; coverImage: string; dominantColor: string | null };
  user: { firstName: string; username: string | null };
}

export async function getLatestComments(allowedRatings: AgeRating[], limit = 8): Promise<LatestCommentItem[]> {
  const rows = await prisma.comment.findMany({
    where: { isSpoiler: false, status: "APPROVED", chapter: { comic: { ageRating: { in: allowedRatings } } } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      content: true,
      createdAt: true,
      chapter: {
        select: {
          id: true,
          chapterNumber: true,
          comic: { select: { title: true, slug: true, coverImage: true, dominantColor: true } },
        },
      },
      user: { select: { firstName: true, username: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
    chapterId: r.chapter.id,
    chapterNumber: r.chapter.chapterNumber,
    comic: r.chapter.comic,
    user: r.user,
  }));
}

export interface CompletedSeriesComic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  dominantColor: string | null;
  chapterCount: number;
}

export async function getCompletedSeries(allowedRatings: AgeRating[], limit = 12): Promise<CompletedSeriesComic[]> {
  const comics = await prisma.comic.findMany({
    where: { ageRating: { in: allowedRatings }, status: "COMPLETED" },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      dominantColor: true,
      _count: { select: { chapters: true } },
    },
  });

  return comics.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    coverImage: c.coverImage,
    dominantColor: c.dominantColor,
    chapterCount: c._count.chapters,
  }));
}

export interface MostBookmarkedComic {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  dominantColor: string | null;
  bookmarkCount: number;
}

export async function getMostBookmarkedComics(allowedRatings: AgeRating[], limit = 12): Promise<MostBookmarkedComic[]> {
  const comics = await prisma.comic.findMany({
    where: { ageRating: { in: allowedRatings } },
    orderBy: { bookmarks: { _count: "desc" } },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      coverImage: true,
      dominantColor: true,
      _count: { select: { bookmarks: true } },
    },
  });

  return comics.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    coverImage: c.coverImage,
    dominantColor: c.dominantColor,
    bookmarkCount: c._count.bookmarks,
  }));
}