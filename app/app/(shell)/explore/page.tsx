import Link from "next/link";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ComicCard } from "@/components/catalog/comic-card";
import { getAllowedAgeRatings } from "@/lib/content-filter";

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

  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });

  const comics = await prisma.comic.findMany({
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
  });

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <form className="mb-6 flex gap-2">
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

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href="/app/explore"
            className={`rounded-full px-3 py-1 text-xs ${
              !genre ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted"
            }`}
          >
            همه
          </Link>
          {genres.map((g) => (
            <Link
              key={g.id}
              href={`/app/explore?genre=${g.id}`}
              className={`rounded-full px-3 py-1 text-xs ${
                genre === g.id ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted"
              }`}
            >
              {g.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {comics.map((comic) => (
            <ComicCard
              key={comic.id}
              slug={comic.slug}
              title={comic.title}
              coverImage={comic.coverImage}
              dominantColor={comic.dominantColor}
              latestChapter={comic.chapters[0]?.chapterNumber ?? null}
            />
          ))}
          {comics.length === 0 && <p className="col-span-full text-sm text-text-muted">موردی یافت نشد.</p>}
        </div>
      </div>
    </main>
  );
}