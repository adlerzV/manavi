"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { searchComments, type SearchCommentsParams, type ModeratedCommentRow } from "@/lib/comments-moderation";
import { safeError } from "@/lib/errors";
import type { CommentStatus } from "@prisma/client";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function listCommentsAdmin(
  params: Omit<SearchCommentsParams, "publisherId">
): Promise<{ comments: ModeratedCommentRow[]; total: number }> {
  await requireAdmin();
  return searchComments(params);
}

async function revalidateComment(commentId: string) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { chapterId: true } });
  if (comment) revalidatePath(`/app/read/${comment.chapterId}`);
}

export async function setCommentStatusAdmin(commentId: string, status: CommentStatus): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await prisma.comment.update({
      where: { id: commentId },
      data: { status, moderatedById: admin.id, moderatedAt: new Date() },
    });
    await revalidateComment(commentId);
    revalidatePath("/admin/comments");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export async function updateCommentContentAdmin(commentId: string, content: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const trimmed = content.trim();
    if (!trimmed) return { success: false, error: "متن نظر نمی‌تواند خالی باشد" };
    if (trimmed.length > 2000) return { success: false, error: "متن نظر بیش از حد طولانی است" };

    await prisma.comment.update({ where: { id: commentId }, data: { content: trimmed, editedAt: new Date() } });
    await revalidateComment(commentId);
    revalidatePath("/admin/comments");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}

export async function deleteCommentAdmin(commentId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { chapterId: true } });

    await prisma.$transaction([
      prisma.comment.deleteMany({ where: { parentId: commentId } }),
      prisma.comment.delete({ where: { id: commentId } }),
    ]);

    if (comment) revalidatePath(`/app/read/${comment.chapterId}`);
    revalidatePath("/admin/comments");
    return { success: true };
  } catch (err) {
    return safeError(err);
  }
}