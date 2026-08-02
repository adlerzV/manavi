const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const MINI_APP_URL = process.env.NEXT_PUBLIC_MINI_APP_URL as string;

interface NotifyChapterInput {
  telegramIds: bigint[];
  comicTitle: string;
  comicSlug: string;
  chapterNumber: number;
  chapterId: string;
}

async function sendMessage(chatId: bigint, text: string, url: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId.toString(),
      text,
      reply_markup: {
        inline_keyboard: [[{ text: "خواندن چپتر جدید", web_app: { url } }]],
      },
    }),
  });
}

export async function notifyNewChapter(input: NotifyChapterInput) {
  if (!BOT_TOKEN || input.telegramIds.length === 0) return;

  const readUrl = `${MINI_APP_URL}/app/read/${input.chapterId}`;
  const text = `فصل جدید ${input.comicTitle} منتشر شد: چپتر ${input.chapterNumber}`;

  for (const telegramId of input.telegramIds) {
    try {
      await sendMessage(telegramId, text, readUrl);
    } catch {
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }
}