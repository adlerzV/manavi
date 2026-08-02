import Link from "next/link";
import Image from "next/image";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ComicCard } from "@/components/catalog/comic-card";
import { getAllowedAgeRatings } from "@/lib/content-filter";

export const revalidate = 300;

async function getFeatured(allowedRatings: AgeRating[]) {
  return prisma.comic.findFirst({
    where: { ageRating: { in: allowedRatings } },
    orderBy: { bookmarks: { _count: "desc" } },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      dominantColor: true,
    },
  });
}

async function getPopular(allowedRatings: AgeRating[], excludeId?: string) {
  return prisma.comic.findMany({
    where: {
      ageRating: { in: allowedRatings },
      id: excludeId ? { not: excludeId } : undefined,
    },
    orderBy: { bookmarks: { _count: "desc" } },
    take: 12,
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
}

async function getLatestUpdates(allowedRatings: AgeRating[]) {
  const rows = await prisma.chapter.findMany({
    where: { publishedAt: { not: null }, comic: { ageRating: { in: allowedRatings } } },
    orderBy: { publishedAt: "desc" },
    distinct: ["comicId"],
    take: 12,
    select: {
      chapterNumber: true,
      comic: { select: { id: true, title: true, slug: true, coverImage: true, dominantColor: true } },
    },
  });
  return rows.map((r) => ({ ...r.comic, latestChapter: r.chapterNumber }));
}

export default async function AppHomePage() {
  const allowedRatings = await getAllowedAgeRatings();
  const featured = await getFeatured(allowedRatings);
  const [popular, latest] = await Promise.all([
    getPopular(allowedRatings, featured?.id),
    getLatestUpdates(allowedRatings),
  ]);

  return (
    <main className="min-h-screen bg-background">
      {featured && (
        <section
          className="px-4 pb-10 pt-16"
          style={{
            backgroundImage: `linear-gradient(to bottom, ${featured.dominantColor ?? "#1E1E1E"}, #121212 85%)`,
          }}
        >
          <div className="mx-auto flex max-w-4xl flex-col items-start gap-4 sm:flex-row sm:items-end">
            <Image
              src={featured.coverImage}
              alt={featured.title}
              width={160}
              height={240}
              className="h-48 w-32 flex-shrink-0 rounded-md object-cover shadow-lg sm:h-60 sm:w-40"
            />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-text-muted">پیشنهاد ویژه</p>
              <h1 className="mt-1 text-2xl font-semibold text-text-main sm:text-3xl">{featured.title}</h1>
              <p className="mt-2 line-clamp-2 max-w-md text-sm text-text-muted">{featured.description}</p>
              <Link
                href={`/app/comic/${featured.slug}`}
                className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
              >
                مشاهده عنوان
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-4 text-lg font-medium text-text-main">محبوب‌ترین‌ها</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {popular.map((comic) => (
            <ComicCard
              key={comic.id}
              slug={comic.slug}
              title={comic.title}
              coverImage={comic.coverImage}
              dominantColor={comic.dominantColor}
              latestChapter={comic.chapters[0]?.chapterNumber ?? null}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-4 text-lg font-medium text-text-main">تازه‌های به‌روزرسانی</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {latest.map((comic) => (
            <ComicCard
              key={comic.id}
              slug={comic.slug}
              title={comic.title}
              coverImage={comic.coverImage}
              dominantColor={comic.dominantColor}
              latestChapter={comic.latestChapter}
            />
          ))}
        </div>
      </section>
    </main>
  );
}