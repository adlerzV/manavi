import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ComicCard } from "@/components/catalog/comic-card";

export const revalidate = 300;

const PUBLIC_WHERE = { ageRating: "NORMAL" as const };

async function getFeatured() {
  return prisma.comic.findFirst({
    where: PUBLIC_WHERE,
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

async function getPopular(excludeId?: string) {
  return prisma.comic.findMany({
    where: { ...PUBLIC_WHERE, id: excludeId ? { not: excludeId } : undefined },
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

async function getLatestUpdates() {
  const rows = await prisma.chapter.findMany({
    where: { publishedAt: { not: null }, comic: PUBLIC_WHERE },
    orderBy: { publishedAt: "desc" },
    distinct: ["comicId"],
    take: 12,
    select: {
      chapterNumber: true,
      comic: {
        select: { id: true, title: true, slug: true, coverImage: true, dominantColor: true },
      },
    },
  });
  return rows.map((r) => ({ ...r.comic, latestChapter: r.chapterNumber }));
}

export default async function HomePage() {
  const featured = await getFeatured();
  const [popular, latest] = await Promise.all([
    getPopular(featured?.id),
    getLatestUpdates(),
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
            <img
              src={featured.coverImage}
              alt={featured.title}
              className="h-48 w-32 flex-shrink-0 rounded-md object-cover shadow-lg sm:h-60 sm:w-40"
            />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-text-muted">Featured</p>
              <h1 className="mt-1 text-2xl font-semibold text-text-main sm:text-3xl">
                {featured.title}
              </h1>
              <p className="mt-2 line-clamp-2 max-w-md text-sm text-text-muted">
                {featured.description}
              </p>
              <Link
                href={`/comic/${featured.slug}`}
                className="mt-4 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
              >
                View title
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-8">
        <h2 className="mb-4 text-lg font-medium text-text-main">Popular</h2>
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
        <h2 className="mb-4 text-lg font-medium text-text-main">Latest updates</h2>
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