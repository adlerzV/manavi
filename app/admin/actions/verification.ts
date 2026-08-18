"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { logAuditEvent } from "@/lib/audit-log";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function setPublisherVerified(publisherId: string, isVerified: boolean): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.publisher.update({ where: { id: publisherId }, data: { isVerified } });
    after(() =>
      logAuditEvent({
        actorId: admin.id,
        actorRole: admin.role,
        action: "publisher.verify",
        targetType: "Publisher",
        targetId: publisherId,
        metadata: { isVerified },
      })
    );
    revalidatePath("/admin/publishers");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export interface PublisherStaffMemberRow {
  userId: string;
  firstName: string;
  username: string | null;
  roles: string[];
  isVerified: boolean;
}

export async function listPublisherStaffMembers(publisherId: string): Promise<PublisherStaffMemberRow[]> {
  await requireAdmin();

  const rows = await prisma.publisherStaff.findMany({
    where: { publisherId },
    include: { user: { select: { id: true, firstName: true, username: true } } },
  });

  const byUser = new Map<string, PublisherStaffMemberRow>();
  for (const row of rows) {
    const existing = byUser.get(row.userId);
    if (existing) {
      existing.roles.push(row.role);
      existing.isVerified = existing.isVerified || row.isVerified;
    } else {
      byUser.set(row.userId, {
        userId: row.userId,
        firstName: row.user.firstName,
        username: row.user.username,
        roles: [row.role],
        isVerified: row.isVerified,
      });
    }
  }

  return [...byUser.values()];
}

export async function setPublisherStaffMemberVerified(
  publisherId: string,
  userId: string,
  isVerified: boolean
): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.publisherStaff.updateMany({ where: { publisherId, userId }, data: { isVerified } });
    after(() =>
      logAuditEvent({
        actorId: admin.id,
        actorRole: admin.role,
        action: "staff.verify",
        targetType: "User",
        targetId: userId,
        metadata: { publisherId, isVerified },
      })
    );
    revalidatePath("/admin/publishers");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}