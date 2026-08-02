import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مناوی — پلتفرم خوانش مانهوا و مانگا",
  description: "پلتفرم خوانش آنلاین مانهوا، مانگا و وبتون در تلگرام",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-background text-text-main antialiased">{children}</body>
    </html>
  );
}