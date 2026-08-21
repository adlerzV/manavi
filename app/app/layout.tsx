import type { ReactNode } from "react";
import { TelegramAuthProvider } from "@/components/providers/telegram-auth-provider";

export default function MiniAppLayout({ children }: { children: ReactNode }) {
  return <TelegramAuthProvider>{children}</TelegramAuthProvider>;
}