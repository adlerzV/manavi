import { NextRequest, NextResponse } from "next/server";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const MINI_APP_URL = process.env.NEXT_PUBLIC_MINI_APP_URL as string;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const update = await req.json().catch(() => null);
  const message = update?.message;

  if (message?.text === "/start" && message.chat?.id) {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: "به مناوی خوش آمدید! برای شروع مطالعه روی دکمه زیر بزنید.",
        reply_markup: {
          inline_keyboard: [[{ text: "باز کردن مینی‌اپ", web_app: { url: `${MINI_APP_URL}/app` } }]],
        },
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}