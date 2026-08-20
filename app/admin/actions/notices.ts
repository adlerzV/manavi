"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { NOTICES_TAG } from "@/lib/notices";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface NoticeRow {
  id: string;
  message: string;
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export async function listNotices(): Promise<NoticeRow[]> {
  await requireAdmin();

  await prisma.adminNotice.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});

  const notices = await prisma.adminNotice.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const now = Date.now();
  return notices.map((n) => ({
    id: n.id,
    message: n.message,
    createdAt: n.createdAt.toISOString(),
    expiresAt: n.expiresAt.toISOString(),
    isActive: n.expiresAt.getTime() > now,
  }));
}

const MAX_MESSAGE_LENGTH = 500;

export async function createNotice(input: { message: string; durationHours: number }): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();

    const message = input.message.trim();
    if (!message) return { success: false, error: "متن اعلان خالی است" };
    if (message.length > MAX_MESSAGE_LENGTH) {
      return { success: false, error: `متن اعلان نباید بیش از ${MAX_MESSAGE_LENGTH} کاراکتر باشد` };
    }
    if (!Number.isFinite(input.durationHours) || input.durationHours <= 0 || input.durationHours > 24 * 30) {
      return { success: false, error: "مدت نمایش نامعتبر است" };
    }

    await prisma.adminNotice.create({
      data: {
        message,
        createdById: admin.id,
        expiresAt: new Date(Date.now() + input.durationHours * 60 * 60 * 1000),
      },
    });

    revalidateTag(NOTICES_TAG, "max");
    revalidatePath("/admin/notices");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export async function deleteNotice(noticeId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.adminNotice.delete({ where: { id: noticeId } });
    revalidateTag(NOTICES_TAG, "max");
    revalidatePath("/admin/notices");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}