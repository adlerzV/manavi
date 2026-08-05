import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifySessionToken } from "./session";
import type { User, Publisher } from "@prisma/client";

export type SessionUser = User & { publisherProfile: Publisher | null };

export interface PublisherContext {
  publisherId: string;
  isOwner: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const session = verifySessionToken(token);
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { publisherProfile: true },
  });
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return user;
}

export async function requireUploadAccess(comicId: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  if (user.role === "ADMIN") {
    return user;
  }

  const comic = await prisma.comic.findUnique({
    where: { id: comicId },
    select: { license: { select: { publisherId: true } } },
  });
  if (!comic) {
    throw new Error("Comic not found");
  }

  if (user.publisherProfile?.id === comic.license.publisherId) {
    return user;
  }

  const staffLink = await prisma.publisherStaff.findFirst({
    where: { userId: user.id, publisherId: comic.license.publisherId, canUpload: true },
  });
  if (staffLink) {
    return user;
  }

  throw new Error("Not authorized to upload for this comic");
}

export async function getPublisherContext(user: SessionUser | null): Promise<PublisherContext | null> {
  if (!user) return null;

  if (user.publisherProfile) {
    return { publisherId: user.publisherProfile.id, isOwner: true };
  }

  const staffLink = await prisma.publisherStaff.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    select: { publisherId: true },
  });
  if (staffLink) {
    return { publisherId: staffLink.publisherId, isOwner: false };
  }

  return null;
}