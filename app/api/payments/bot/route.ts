import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";

function getBotToken(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || null;
}

const MINI_APP_URL = process.env.NEXT_PUBLIC_MINI_APP_URL ?? "";
const BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
const MINI_APP_SHORT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_SHORT_NAME;
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

interface TelegramUpdate {
  message?: {
    text?: string;
    chat?: { id: number };
  };
}

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

function parseStartCommand(text: string): { isStart: boolean; startParam?: string } {
  if (!text.startsWith("/start")) return { isStart: false };
  const parts = text.trim().split(/\s+/);
  return { isStart: true, startParam: parts.length > 1 ? parts[1] : undefined };
}

async function sendWelcomeMessage(botToken: string, chatId: number, startParam?: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "به مناوی خوش آمدید! برای شروع مطالعه روی دکمه زیر بزنید.",
      reply_markup: buildOpenKeyboard(startParam),
    }),
  }).catch(() => {});
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && !WEBHOOK_SECRET) {
    return NextResponse.json({ error: "webhook secret not configured" }, { status: 500 });
  }
  if (WEBHOOK_SECRET) {
    const provided = req.headers.get("x-telegram-bot-api-secret-token");
    if (provided !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const update = (await req.json().catch(() => null)) as TelegramUpdate | null;
  const text = update?.message?.text;
  const chatId = update?.message?.chat?.id;

  if (typeof text === "string" && typeof chatId === "number") {
    const { isStart, startParam } = parseStartCommand(text);
    const botToken = getBotToken();
    if (isStart && botToken) {
      after(() => sendWelcomeMessage(botToken, chatId, startParam));
    }
  }

  return NextResponse.json({ ok: true });
}