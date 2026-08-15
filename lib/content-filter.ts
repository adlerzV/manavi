import type { AgeRating } from "@prisma/client";
import { getSessionUser } from "./auth";

const ALL_RATINGS: AgeRating[] = ["NORMAL", "EIGHTEEN_PLUS", "NSFW"];
const SAFE_RATINGS: AgeRating[] = ["NORMAL"];

export async function getAllowedAgeRatings(): Promise<AgeRating[]> {
  const user = await getSessionUser();
  return user?.isAgeVerified ? ALL_RATINGS : SAFE_RATINGS;
}