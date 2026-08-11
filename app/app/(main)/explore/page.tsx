import Link from "next/link";
import { after } from "next/server";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ComicCard } from "@/components/catalog/comic-card";
import { GenreGrid } from "@/components/catalog/genre-grid";
import { TopSearches } from "@/components/catalog/top-searches";
import { getAllowedAgeRatings } from "@/lib/content-filter";
import { getVisibleGenres } from "@/lib/genres";
import { recordSearchTerm, getTopSearchTerms } from "@/app/actions/search";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ q?: string; genre?: string; rating?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { q, genre, rating } = await searchParams;
  const allowedRatings = await getAllowedAgeRatings();

  const requestedRating = rating as AgeRating | undefined;
  const effectiveRatings: AgeRating[] =
    requestedRating && allowedRatings.includes(requestedRating) ? [requestedRating] : allowedRatings;

  // اجرای غیرمسدودکننده ثبت عبارات جستجو در پس‌زمینه
  if (q?.trim()) {
    after(() => recordSearchTerm(q.trim()));
  }

  const showingResults = Boolean(q || genre);

  const [genres, topSearches, comics] = await Promise.all([
    getVisibleGenres(allowedRatings),
    getTopSearchTerms(10),
    showingResults
      ? prisma.comic.findMany({
          where: {
            ageRating: { in: effectiveRatings },
            title: q ? { contains: q, mode: "insensitive" } : undefined,
            genres: genre ? { some: { genreId: genre } } : undefined,
          },
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            dominantColor: true,
            chapters: {
              where: { publishedAt: { not: null } },
              orderBy: { chapterNumber: "desc" },
              take: 1,
              select: { chapterNumber: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <form className="mb-4 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="جستجوی عنوان..."
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            جستجو
          </button>
        </form>

        {!showingResults && topSearches.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-medium text-text-muted">بیشترین جستجوها</h2>
            <TopSearches terms={topSearches} />
          </div>
        )}

        {!showingResults && genres.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-medium text-text-muted">دسته‌بندی‌ها</h2>
            <GenreGrid genres={genres} />
          </div>
        )}

        {showingResults && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link href="/app/explore" className="rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
              پاک کردن فیلتر
            </Link>
            {genre && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {genres.find((g) => g.id === genre)?.name ?? "دسته‌بندی"}
              </span>
            )}
          </div>
        )}

        {showingResults && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {comics.map((comic, index) => (
              <ComicCard
                key={comic.id}
                slug={comic.slug}
                title={comic.title}
                coverImage={comic.coverImage}
                dominantColor={comic.dominantColor}
                latestChapter={comic.chapters[0]?.chapterNumber ?? null}
                priority={index < 4}
              />
            ))}
            {comics.length === 0 && <p className="col-span-full text-sm text-text-muted">موردی یافت نشد.</p>}
          </div>
        )}
      </div>
    </main>
  );
}