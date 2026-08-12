import type { ReactNode } from "react";
import { TelegramAuthProvider } from "@/components/providers/telegram-auth-provider";
import { TonConnectProvider } from "@/components/providers/ton-connect-provider";

export default function MiniAppLayout({ children }: { children: ReactNode }) {
  return (
    <TonConnectProvider>
      <TelegramAuthProvider>{children}</TelegramAuthProvider>
    </TonConnectProvider>
  );
}