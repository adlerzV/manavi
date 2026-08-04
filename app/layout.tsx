import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const yekanFont = localFont({
  src: "./fonts/Yekan.woff",
  variable: "--font-yekan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "مناوی — پلتفرم خوانش مانهوا و مانگا",
  description: "پلتفرم خوانش آنلاین مانهوا، مانگا و وبتون در تلگرام",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className={yekanFont.variable}>
      <body className="font-sans bg-background text-text-main antialiased">
        {children}
      </body>
    </html>
  );
}