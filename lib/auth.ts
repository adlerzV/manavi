import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { verifySessionToken } from "./session";
import type { User, Publisher } from "@prisma/client";

export type SessionUser = User & { publisherProfile: Publisher | null };

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