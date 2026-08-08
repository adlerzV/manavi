import type { ReactNode } from "react";
import { TelegramWebAppScript } from "@/components/telegram-web-app-script";
import { TelegramAuthProvider } from "@/components/providers/telegram-auth-provider";
import { TonConnectProvider } from "@/components/providers/ton-connect-provider";

export default function MiniAppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <TelegramWebAppScript />
      <TonConnectProvider>
        <TelegramAuthProvider>{children}</TelegramAuthProvider>
      </TonConnectProvider>
    </>
  );
}