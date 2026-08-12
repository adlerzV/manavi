import Link from "next/link";
import type { ComicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ComicCard } from "@/components/catalog/comic-card";
import { PopularGenreCards } from "@/components/catalog/popular-genre-cards";
import { ExploreSearchClient } from "@/components/catalog/explore-search-client";
import { TopSearches } from "@/components/catalog/top-searches";
import { getAllowedAgeRatings } from "@/lib/content-filter";
import { getAllCategories } from "@/lib/categories";
import { getAllGenres, getPopularGenres } from "@/lib/genres";
import { resolveExploreWhere } from "@/lib/explore";
import { recordSearchTerm, getTopSearchTerms } from "@/app/actions/search";
import { after } from "next/server";

export const revalidate = 60;

const VALID_STATUSES: ComicStatus[] = ["ONGOING", "COMPLETED", "HIATUS"];
const POPULAR_GENRE_LIMIT = 8;

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string; genres?: string; status?: string }>;
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { q, type, genres: genresParam, status: statusParam } = await searchParams;

  const genreIds = genresParam ? genresParam.split(",").filter(Boolean) : [];
  const status = statusParam && VALID_STATUSES.includes(statusParam as ComicStatus) ? (statusParam as ComicStatus) : undefined;

  const showingResults = Boolean(q?.trim() || type || genreIds.length > 0 || status);

  if (q?.trim()) {
    after(() => recordSearchTerm(q.trim()));
  }

  const allowedRatings = await getAllowedAgeRatings();

  const [categories, allGenres, popularGenres, topSearches, comics] = await Promise.all([
    getAllCategories(),
    getAllGenres(),
    showingResults ? Promise.resolve([]) : getPopularGenres(allowedRatings, POPULAR_GENRE_LIMIT),
    showingResults ? Promise.resolve([]) : getTopSearchTerms(10),
    showingResults
      ? resolveExploreWhere({ q, categorySlug: type, genreIds, status }).then((where) =>
          prisma.comic.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: 60,
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
        )
      : Promise.resolve([]),
  ]);

  const categoryFilterOptions = categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  const genreFilterOptions = allGenres.map((g) => ({ id: g.id, name: g.name }));

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <ExploreSearchClient categories={categoryFilterOptions} genres={genreFilterOptions} />

        {!showingResults && (
          <div className="mt-6 space-y-8">
            {popularGenres.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-medium text-text-main">دسته‌بندی‌های داغ</h2>
                <PopularGenreCards genres={popularGenres} />
              </div>
            )}

            {topSearches.length > 0 && (
              <div>
                <h2 className="mb-2 text-xs font-medium text-text-muted">بیشترین جستجوها</h2>
                <TopSearches terms={topSearches} />
              </div>
            )}
          </div>
        )}

        {showingResults && (
          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-text-muted">{comics.length.toLocaleString("fa-IR")} نتیجه</p>
              <Link href="/app/explore" className="text-xs text-primary">
                پاک کردن و شروع دوباره
              </Link>
            </div>

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
              {comics.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-text-muted">
                  با این فیلترها موردی یافت نشد — فیلترها را کمتر کنید.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}