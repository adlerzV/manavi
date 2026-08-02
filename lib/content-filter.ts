import type { AgeRating } from "@prisma/client";
import { getSessionUser } from "./auth";

const RATING_ORDER: AgeRating[] = ["NORMAL", "EIGHTEEN_PLUS", "NSFW"];

export async function getAllowedAgeRatings(): Promise<AgeRating[]> {
  const user = await getSessionUser();
  const preference = user?.contentPreference ?? "NORMAL";
  const maxIndex = RATING_ORDER.indexOf(preference);
  return RATING_ORDER.slice(0, maxIndex + 1);
}