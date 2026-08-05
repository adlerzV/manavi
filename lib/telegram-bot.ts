import "server-only";
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const MINI_APP_URL = process.env.NEXT_PUBLIC_MINI_APP_URL as string;

interface NotifyChapterInput {
  telegramIds: bigint[];
  comicTitle: string;
  comicSlug: string;
  chapterNumber: number;
  chapterId: string;
}

interface SendOptions {
  buttonText?: string;
  buttonUrl?: string;
}

async function sendTelegramMessage(chatId: bigint, text: string, options?: SendOptions) {
  const reply_markup = options?.buttonText && options?.buttonUrl
    ? { inline_keyboard: [[{ text: options.buttonText, web_app: { url: options.buttonUrl } }]] }
    : undefined;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId.toString(),
      text,
      ...(reply_markup ? { reply_markup } : {}),
    }),
  });
}

export async function notifyNewChapter(input: NotifyChapterInput) {
  if (!BOT_TOKEN || input.telegramIds.length === 0) return;

  const readUrl = `${MINI_APP_URL}/app/read/${input.chapterId}`;
  const text = `فصل جدید ${input.comicTitle} منتشر شد: چپتر ${input.chapterNumber}`;

  for (const telegramId of input.telegramIds) {
    try {
      await sendTelegramMessage(telegramId, text, { buttonText: "خواندن چپتر جدید", buttonUrl: readUrl });
    } catch {
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
}

export interface BroadcastResult {
  sent: number;
  failed: number;
}

export async function broadcastMessage(input: {
  telegramIds: bigint[];
  text: string;
  buttonText?: string;
  buttonUrl?: string;
}): Promise<BroadcastResult> {
  if (!BOT_TOKEN) return { sent: 0, failed: input.telegramIds.length };

  let sent = 0;
  let failed = 0;

  for (const telegramId of input.telegramIds) {
    try {
      await sendTelegramMessage(telegramId, input.text, { buttonText: input.buttonText, buttonUrl: input.buttonUrl });
      sent += 1;
    } catch {
      failed += 1;
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  return { sent, failed };
}