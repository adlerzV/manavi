import Link from "next/link";
import Image from "next/image";
import type { AgeRating } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { HomeComicCard } from "@/components/catalog/home-comic-card";
import { getAllowedAgeRatings } from "@/lib/content-filter";
import { CoinBalanceHeader } from "@/components/home/coin-balance-header";
import { FloatingDailyClaim } from "@/components/home/floating-daily-claim";

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

async function getFeatured(allowedRatings: AgeRating[]) {
  const flagged = await prisma.comic.findFirst({
    where: { ageRating: { in: allowedRatings }, isFeaturedOnHome: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, slug: true, description: true, coverImage: true, dominantColor: true, featuredBadge: true },
  });
  if (flagged) return flagged;

  return prisma.comic.findFirst({
    where: { ageRating: { in: allowedRatings } },
    orderBy: { bookmarks: { _count: "desc" } },
    select: { id: true, title: true, slug: true, description: true, coverImage: true, dominantColor: true, featuredBadge: true },
  });
}

async function getPopular(allowedRatings: AgeRating[], excludeId?: string) {
  return prisma.comic.findMany({
    where: { ageRating: { in: allowedRatings }, id: excludeId ? { not: excludeId } : undefined },
    orderBy: { bookmarks: { _count: "desc" } },
    take: 12,
    select: {
      id: true, title: true, slug: true, coverImage: true, dominantColor: true,
      chapters: { where: { publishedAt: { not: null } }, orderBy: { chapterNumber: "desc" }, take: 1, select: { chapterNumber: true } },
    },
  });
}

async function getLatestUpdates(allowedRatings: AgeRating[]) {
  const rows = await prisma.chapter.findMany({
    where: { publishedAt: { not: null }, comic: { ageRating: { in: allowedRatings } } },
    orderBy: { publishedAt: "desc" },
    distinct: ["comicId"],
    take: 12,
    select: { chapterNumber: true, comic: { select: { id: true, title: true, slug: true, coverImage: true, dominantColor: true } } },
  });
  return rows.map((r) => ({ ...r.comic, latestChapter: r.chapterNumber }));
}

export default async function AppHomePage() {
  const [user, allowedRatings] = await Promise.all([getSessionUser(), getAllowedAgeRatings()]);
  const featured = await getFeatured(allowedRatings);
  const [popular, latest] = await Promise.all([getPopular(allowedRatings, featured?.id), getLatestUpdates(allowedRatings)]);
  const alreadyClaimedToday = Boolean(user?.lastCheckinAt && isSameCalendarDay(user.lastCheckinAt, new Date()));

  return (
    <main className="min-h-screen bg-background">
      <CoinBalanceHeader
        coinsBalance={user?.coinsBalance ?? 0}
        subscriptionEnd={user?.subscriptionEnd?.toISOString() ?? null}
        authenticated={Boolean(user)}
      />

      {featured && (
        <section className="px-4 pb-10 pt-8" style={{ backgroundImage: `linear-gradient(to bottom, ${featured.dominantColor ?? "#1E1E1E"}, #121212 85%)` }}>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl">
            <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
              <Image src={featured.coverImage} alt={featured.title} fill priority sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1) 60%)" }} />
              <div className="absolute inset-x-0 bottom-0 p-5">
                {featured.featuredBadge && (
                  <span className="mb-2 inline-block rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">{featured.featuredBadge}</span>
                )}
                <h1 className="text-xl font-semibold text-white sm:text-2xl">{featured.title}</h1>
                <p className="mt-1 line-clamp-2 max-w-md text-xs text-white/70 sm:text-sm">{featured.description}</p>
                <Link href={`/app/comic/${featured.slug}`} className="mt-3 inline-block rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">مشاهده عنوان</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="mb-3 text-base font-medium text-text-main">محبوب‌ترین‌ها</h2>
        <div className="grid grid-cols-3 gap-3">
          {popular.map((comic) => (
            <HomeComicCard key={comic.id} slug={comic.slug} title={comic.title} coverImage={comic.coverImage} latestChapter={comic.chapters[0]?.chapterNumber ?? null} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-6">
        <h2 className="mb-3 text-base font-medium text-text-main">تازه‌های به‌روزرسانی</h2>
        <div className="grid grid-cols-3 gap-3">
          {latest.map((comic) => (
            <HomeComicCard key={comic.id} slug={comic.slug} title={comic.title} coverImage={comic.coverImage} latestChapter={comic.latestChapter} />
          ))}
        </div>
      </section>

      {user && <FloatingDailyClaim alreadyClaimedToday={alreadyClaimedToday} />}
    </main>
  );
}