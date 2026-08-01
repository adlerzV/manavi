import type { ReactNode } from "react";
import type { Metadata } from "next";
import { TelegramWebAppScript } from "@/components/telegram-web-app-script";
import { TelegramAuthProvider } from "@/components/providers/telegram-auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webtoon",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-text-main antialiased">
        <TelegramWebAppScript />
        <TelegramAuthProvider>{children}</TelegramAuthProvider>
      </body>
    </html>
  );
}