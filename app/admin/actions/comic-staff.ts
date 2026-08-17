"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireComicManageAccessByComicId } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import type { StaffRole } from "@prisma/client";

interface ActionResult<T = undefined> { success: boolean; error?: string; data?: T }

export interface ComicStaffRow {
  id: string;
  roleTitle: StaffRole;
  user: { id: string; firstName: string; username: string | null };
}

export async function listComicStaff(comicId: string): Promise<ComicStaffRow[]> {
  await requireComicManageAccessByComicId(comicId);
  return prisma.comicStaff.findMany({
    where: { comicId },
    include: { user: { select: { id: true, firstName: true, username: true } } },
  });
}

export async function addComicStaff(comicId: string, telegramUsername: string, roleTitle: StaffRole): Promise<ActionResult> {
  try {
    await requireComicManageAccessByComicId(comicId);
    const username = telegramUsername.trim().replace("@", "");
    if (!username) return { success: false, error: "یوزرنیم تلگرام الزامی است" };

    const targetUser = await prisma.user.findFirst({ where: { username } });
    if (!targetUser) return { success: false, error: "کاربری با این یوزرنیم پیدا نشد" };

    await prisma.comicStaff.upsert({
      where: { comicId_userId_roleTitle: { comicId, userId: targetUser.id, roleTitle } },
      update: {},
      create: { comicId, userId: targetUser.id, roleTitle },
    });

    revalidatePath(`/admin/comics/${comicId}`);
    revalidatePath(`/publisher/comics/${comicId}`);
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export async function removeComicStaff(comicId: string, staffId: string): Promise<ActionResult> {
  try {
    await requireComicManageAccessByComicId(comicId);
    await prisma.comicStaff.deleteMany({ where: { id: staffId, comicId } });
    revalidatePath(`/admin/comics/${comicId}`);
    revalidatePath(`/publisher/comics/${comicId}`);
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}