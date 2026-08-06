import { getSessionUser } from "@/lib/auth";
import { getAllowedAgeRatings } from "@/lib/content-filter";
import { getAllGenres } from "@/lib/genres";
import {
  getHeroComics,
  getGenreBasedRecommendations,
  getLatestComments,
  getCompletedSeries,
  getMostBookmarkedComics,
} from "@/lib/home-feed";
import { getHomeFeedComics } from "@/app/actions/home-feed";
import { CoinBalanceHeader } from "@/components/home/coin-balance-header";
import { FloatingDailyClaim } from "@/components/home/floating-daily-claim";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { NewestPopularSection } from "@/components/home/newest-popular-section";
import { RecommendedSection } from "@/components/home/recommended-section";
import { MostBookmarkedSection } from "@/components/home/most-bookmarked-section";
import { CompletedSeriesSection } from "@/components/home/completed-series-section";
import { LatestCommentsSection } from "@/components/home/latest-comments-section";

export const revalidate = 300;

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default async function AppHomePage() {
  const [user, allowedRatings] = await Promise.all([getSessionUser(), getAllowedAgeRatings()]);

  const [heroComics, genres, newest, popular, mostBookmarked, completedSeries, latestComments, recommendations] = await Promise.all([
    getHeroComics(allowedRatings),
    getAllGenres(),
    getHomeFeedComics("newest"),
    getHomeFeedComics("popular"),
    getMostBookmarkedComics(allowedRatings),
    getCompletedSeries(allowedRatings),
    getLatestComments(allowedRatings),
    user ? getGenreBasedRecommendations(user.id, allowedRatings) : Promise.resolve([]),
  ]);

  const shuffledHeroComics = heroComics.length > 1 ? [...heroComics].sort(() => Math.random() - 0.5) : heroComics;
  const alreadyClaimedToday = Boolean(user?.lastCheckinAt && isSameCalendarDay(user.lastCheckinAt, new Date()));

  return (
    <main className="min-h-screen bg-background">
      <CoinBalanceHeader
        coinsBalance={user?.coinsBalance ?? 0}
        subscriptionEnd={user?.subscriptionEnd?.toISOString() ?? null}
        authenticated={Boolean(user)}
      />

      <HeroCarousel comics={shuffledHeroComics} />

      <NewestPopularSection initialNewest={newest} initialPopular={popular} genres={genres.map((g) => ({ id: g.id, name: g.name }))} />

      {recommendations.length > 0 && <RecommendedSection comics={recommendations} />}

      <MostBookmarkedSection comics={mostBookmarked} />

      <CompletedSeriesSection comics={completedSeries} />

      <LatestCommentsSection comments={latestComments} />

      {user && <FloatingDailyClaim alreadyClaimedToday={alreadyClaimedToday} />}
    </main>
  );
}