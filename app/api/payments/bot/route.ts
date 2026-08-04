import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const MINI_APP_URL = process.env.NEXT_PUBLIC_MINI_APP_URL as string;
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
const MINI_APP_SHORT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_SHORT_NAME;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

function buildOpenKeyboard(startParam?: string) {
  if (startParam && BOT_USERNAME && MINI_APP_SHORT_NAME) {
    return {
      inline_keyboard: [
        [
          {
            text: "باز کردن مینی‌اپ",
            url: `https://t.me/${BOT_USERNAME}/${MINI_APP_SHORT_NAME}?startapp=${encodeURIComponent(startParam)}`,
          },
        ],
      ],
    };
  }
  return {
    inline_keyboard: [[{ text: "باز کردن مینی‌اپ", web_app: { url: `${MINI_APP_URL}/app` } }]],
  };
}

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const update = await req.json().catch(() => null);
  const message = update?.message;

  if (typeof message?.text === "string" && message.text.startsWith("/start") && message.chat?.id) {
    const parts = message.text.trim().split(/\s+/);
    const startParam = parts.length > 1 ? parts[1] : undefined;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: "به مناوی خوش آمدید! برای شروع مطالعه روی دکمه زیر بزنید.",
        reply_markup: buildOpenKeyboard(startParam),
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}