const TELEGRAM_BOT_USERNAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
const TELEGRAM_MINI_APP_SHORT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_MINI_APP_SHORT_NAME;

export interface TelegramLinks {
  webLink: string;
  nativeLink: string;
}

export function getTelegramLinks(): TelegramLinks | null {
  if (!TELEGRAM_BOT_USERNAME || !TELEGRAM_MINI_APP_SHORT_NAME) return null;
  return {
    webLink: `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_MINI_APP_SHORT_NAME}`,
    nativeLink: `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}&appname=${TELEGRAM_MINI_APP_SHORT_NAME}`,
  };
}

export function getReferralLink(code: string): string | null {
  if (!TELEGRAM_BOT_USERNAME || !TELEGRAM_MINI_APP_SHORT_NAME) return null;
  return `https://t.me/${TELEGRAM_BOT_USERNAME}/${TELEGRAM_MINI_APP_SHORT_NAME}?startapp=${encodeURIComponent(code)}`;
}