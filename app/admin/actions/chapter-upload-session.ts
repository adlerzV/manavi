"use server";
import { randomBytes } from "crypto";
import { redis } from "@/lib/redis";
import { getSessionUser, requireUploadAccess } from "@/lib/auth";

const SESSION_TTL_SECONDS = 30 * 60;

export async function createChapterUploadSession(input: {
  comicId: string;
  chapterNumber: number;
  title?: string;
  accessType: string;
}): Promise<{ success: boolean; error?: string; deepLink?: string }> {
  const user = await getSessionUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    await requireUploadAccess(input.comicId);
  } catch {
    return { success: false, error: "دسترسی غیرمجاز" };
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  if (!botUsername) return { success: false, error: "ربات پیکربندی نشده است" };

  const token = randomBytes(16).toString("hex");
  await redis.set(
    `upload-session:${token}`,
    JSON.stringify({ ...input, telegramId: user.telegramId.toString() }),
    { ex: SESSION_TTL_SECONDS }
  );

  return { success: true, deepLink: `https://t.me/${botUsername}?start=upload_${token}` };
}