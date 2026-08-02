import type { ReactNode } from "react";
import { TelegramWebAppScript } from "@/components/telegram-web-app-script";
import { AdsgramScript } from "@/components/adsgram-script";
import { TelegramAuthProvider } from "@/components/providers/telegram-auth-provider";

export default function MiniAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TelegramWebAppScript />
      <AdsgramScript />
      <TelegramAuthProvider>{children}</TelegramAuthProvider>
    </>
  );
}