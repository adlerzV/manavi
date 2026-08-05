import "server-only";
import type { AgeRating } from "@prisma/client";
import { prisma } from "./prisma";

export interface GenreOption {
  id: string;
  name: string;
  imageUrl: string | null;
}

export async function getAllGenres(): Promise<GenreOption[]> {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, imageUrl: true },
  });
}

export async function getVisibleGenres(allowedRatings: AgeRating[]): Promise<GenreOption[]> {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
    where: { comics: { some: { comic: { ageRating: { in: allowedRatings } } } } },
    select: { id: true, name: true, imageUrl: true },
  });
}