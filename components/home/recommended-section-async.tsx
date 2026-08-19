import type { AgeRating } from "@prisma/client";
import { getSessionUser } from "@/lib/auth";
import { getGenreBasedRecommendations } from "@/lib/home-feed";
import { RecommendedSection } from "./recommended-section";

export async function RecommendedSectionAsync({ allowedRatings }: { allowedRatings: AgeRating[] }) {
  const user = await getSessionUser();
  if (!user) return null;

  const recommendations = await getGenreBasedRecommendations(user.id, allowedRatings);
  if (recommendations.length === 0) return null;

  return <RecommendedSection comics={recommendations} />;
}