"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { safeError } from "@/lib/errors";
import { broadcastMessage } from "@/lib/telegram-bot";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

const MAX_MESSAGE_LENGTH = 3500;
const MAX_BROADCAST_RECIPIENTS = 500;

export async function sendBroadcast(input: {
  message: string;
  buttonText?: string;
  buttonUrl?: string;
}): Promise<ActionResult<{ sent: number; failed: number }>> {
  try {
    await requireAdmin();

    const message = input.message.trim();
    if (!message) return { success: false, error: "متن پیام خالی است" };
    if (message.length > MAX_MESSAGE_LENGTH) {
      return { success: false, error: `متن پیام نباید بیش از ${MAX_MESSAGE_LENGTH} کاراکتر باشد` };
    }

    const users = await prisma.user.findMany({
      where: { isBanned: false },
      select: { telegramId: true },
    });

    if (users.length === 0) {
      return { success: false, error: "کاربری برای ارسال یافت نشد" };
    }
    if (users.length > MAX_BROADCAST_RECIPIENTS) {
      return {
        success: false,
        error: `تعداد گیرندگان (${users.length}) بیش از سقف فعلی (${MAX_BROADCAST_RECIPIENTS}) است — مخاطبان رو محدودتر کن یا این فیچر رو به یک صف پس‌زمینه منتقل کنیم`,
      };
    }

    const buttonUrl = input.buttonUrl?.trim();
    const resolvedButtonUrl = buttonUrl
      ? buttonUrl.startsWith("http")
        ? buttonUrl
        : `${process.env.NEXT_PUBLIC_MINI_APP_URL}${buttonUrl.startsWith("/") ? "" : "/"}${buttonUrl}`
      : undefined;

    const result = await broadcastMessage({
      telegramIds: users.map((u) => u.telegramId),
      text: message,
      buttonText: input.buttonText?.trim() || undefined,
      buttonUrl: resolvedButtonUrl,
    });

    return { success: true, data: result };
  } catch (err) {
    return safeError(err);
  }
}