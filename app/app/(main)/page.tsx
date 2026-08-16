import { getSessionUser } from "@/lib/auth";
import { getAllowedAgeRatings } from "@/lib/content-filter";
import { getAllGenres } from "@/lib/genres";
import { getHomepageCategories } from "@/lib/categories";
import {
  getHeroComics,
  getGenreBasedRecommendations,
  getLatestComments,
  getCompletedSeries,
  getMostBookmarkedComics,
  getCategoryPreview,
} from "@/lib/home-feed";
import { getHomeFeedComics } from "@/app/actions/home-feed";
import { CoinBalanceHeader } from "@/components/home/coin-balance-header";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { NewestPopularSection } from "@/components/home/newest-popular-section";
import { RecommendedSection } from "@/components/home/recommended-section";
import { MostBookmarkedSection } from "@/components/home/most-bookmarked-section";
import { CompletedSeriesSection } from "@/components/home/completed-series-section";
import { LatestCommentsSection } from "@/components/home/latest-comments-section";
import { CategoryRowSection } from "@/components/home/category-row-section";

export const revalidate = 300;

export default async function AppHomePage() {
  const [user, allowedRatings] = await Promise.all([getSessionUser(), getAllowedAgeRatings()]);

  const [
    heroComics,
    genres,
    homepageCategories,
    newest,
    popular,
    mostBookmarked,
    completedSeries,
    latestComments,
    recommendations,
  ] = await Promise.all([
    getHeroComics(allowedRatings),
    getAllGenres(),
    getHomepageCategories(),
    getHomeFeedComics("newest"),
    getHomeFeedComics("popular"),
    getMostBookmarkedComics(allowedRatings),
    getCompletedSeries(allowedRatings),
    getLatestComments(allowedRatings),
    user ? getGenreBasedRecommendations(user.id, allowedRatings) : Promise.resolve([]),
  ]);

  const categoryPreviews = await Promise.all(
    homepageCategories.map((category) => getCategoryPreview(category.id, allowedRatings))
  );

  const shuffledHeroComics = heroComics.length > 1 ? [...heroComics].sort(() => Math.random() - 0.5) : heroComics;

  return (
    <main className="min-h-screen bg-background">
      <CoinBalanceHeader coinsBalance={user?.coinsBalance ?? 0} authenticated={Boolean(user)} />

      <HeroCarousel comics={shuffledHeroComics} />

      <NewestPopularSection initialNewest={newest} initialPopular={popular} genres={genres.map((g) => ({ id: g.id, name: g.name }))} />

      {recommendations.length > 0 && <RecommendedSection comics={recommendations} />}

      {homepageCategories.map((category, i) => (
        <CategoryRowSection key={category.id} category={category} comics={categoryPreviews[i]} />
      ))}

      <MostBookmarkedSection comics={mostBookmarked} />

      <CompletedSeriesSection comics={completedSeries} />

      <LatestCommentsSection comments={latestComments} />
    </main>
  );
}