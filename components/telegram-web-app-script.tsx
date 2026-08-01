import Script from "next/script";

// Must load before any component reads window.Telegram.WebApp — mount this
// once in app/layout.tsx, above <TelegramAuthProvider>.
export function TelegramWebAppScript() {
  return (
    <Script
      src="https://telegram.org/js/telegram-web-app.js"
      strategy="beforeInteractive"
    />
  );
}
