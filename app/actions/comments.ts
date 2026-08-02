"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

interface CreateCommentInput {
  chapterId: string;
  content: string;
  isSpoiler: boolean;
}

interface CreateCommentResult {
  success: boolean;
  error?: string;
  comment?: {
    id: string;
    content: string;
    isSpoiler: boolean;
    createdAt: string;
    user: { firstName: string; lastName: string | null; username: string | null };
  };
}

export async function createComment(input: CreateCommentInput): Promise<CreateCommentResult> {
  const user = await getSessionUser();
  if (!user) {
    return { success: false, error: "برای ارسال نظر باید وارد شوید" };
  }

  const content = input.content.trim();
  if (!content) {
    return { success: false, error: "متن نظر خالی است" };
  }
  if (content.length > 2000) {
    return { success: false, error: "متن نظر بیش از حد طولانی است" };
  }

  const comment = await prisma.comment.create({
    data: {
      chapterId: input.chapterId,
      userId: user.id,
      content,
      isSpoiler: input.isSpoiler,
    },
    select: {
      id: true,
      content: true,
      isSpoiler: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  revalidatePath(`/app/read/${input.chapterId}`);

  return {
    success: true,
    comment: { ...comment, createdAt: comment.createdAt.toISOString() },
  };
}