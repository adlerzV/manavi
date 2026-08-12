import type { Metadata } from "next";
import { getSiteStats } from "@/lib/site-stats";
import { getTelegramLinks } from "@/lib/site-config";
import { generateQrSvg } from "@/lib/qr-code";
import { LandingPage } from "@/components/landing/landing-page";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "مناوی — پلتفرم خوانش مانهوا و مانگا در تلگرام",
  description:
    "مناوی، پلتفرم خوانش آنلاین مانهوا، مانگا و وبتون به‌صورت مینی‌اپ تلگرام. بدون نصب جداگانه، با حمایت مستقیم از مترجمان و طراحان.",
};

export default async function HomePage() {
  const stats = await getSiteStats();
  const links = getTelegramLinks();
  const qrCodeSvg = links ? await generateQrSvg(links.webLink) : null;

  return <LandingPage stats={stats} links={links} qrCodeSvg={qrCodeSvg} />;
}