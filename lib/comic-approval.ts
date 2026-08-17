import "server-only";
import { prisma } from "./prisma";

export async function resolveComicApprovalStatus(
  creatorId: string,
  publisherId: string
): Promise<"APPROVED" | "PENDING_APPROVAL"> {
  const user = await prisma.user.findUnique({ where: { id: creatorId }, select: { role: true } });
  if (user?.role === "ADMIN") return "APPROVED";

  const publisher = await prisma.publisher.findUnique({
    where: { id: publisherId },
    select: { isVerified: true, contractUserId: true },
  });
  if (!publisher) return "PENDING_APPROVAL";

  if (publisher.contractUserId === creatorId) {
    return publisher.isVerified ? "APPROVED" : "PENDING_APPROVAL";
  }

  const staffLink = await prisma.publisherStaff.findFirst({
    where: { userId: creatorId, publisherId },
    select: { isVerified: true },
  });
  return staffLink?.isVerified ? "APPROVED" : "PENDING_APPROVAL";
}