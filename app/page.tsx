import type { Metadata } from "next";
import { getSiteStats } from "@/lib/site-stats";
import { getTelegramLinks } from "@/lib/site-config";
import { generateQrSvg } from "@/lib/qr-code";
import { TelegramCta } from "@/components/landing/telegram-cta";
import { LiveStats } from "@/components/landing/live-stats";
import { CreatorApplicationForm } from "@/components/landing/creator-application-form";

export const revalidate = 600; 

export const metadata: Metadata = {
  title: "مناوی — پلتفرم خوانش مانهوا و مانگا در تلگرام",
  description:
    "مناوی، پلتفرم خوانش آنلاین مانهوا، مانگا و وبتون به‌صورت مینی‌اپ تلگرام. بدون نصب جداگانه، با حمایت مستقیم از مترجمان و طراحان.",
};

export default async function LandingPage() {
  const stats = await getSiteStats();
  const links = getTelegramLinks();
  const qrCodeSvg = links ? await generateQrSvg(links.webLink) : null;

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pb-16 pt-24 text-center">
        <h1 className="text-3xl font-semibold text-text-main sm:text-4xl">
          خوانش مانهوا و مانگا، مستقیم داخل تلگرام
        </h1>
        <p className="max-w-xl text-sm text-text-muted sm:text-base">
          بدون نصب اپلیکیشن جداگانه، بدون ثبت‌نام پیچیده. کافیست مینی‌اپ را باز کنید و مطالعه را شروع کنید.
        </p>

        {links && qrCodeSvg ? (
          <TelegramCta webLink={links.webLink} nativeLink={links.nativeLink} qrCodeSvg={qrCodeSvg} />
        ) : (
          <p className="text-sm text-accent">لینک مینی‌اپ هنوز در تنظیمات محیطی ست نشده است.</p>
        )}
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-16">
        <LiveStats
          readerCount={stats.readerCount}
          comicCount={stats.comicCount}
          totalDonationsToman={stats.totalDonationsToman}
        />
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-xl font-semibold text-text-main">به تیم مترجمان و طراحان بپیوندید</h2>
          <p className="mt-2 text-sm text-text-muted">
            پورسانت شفاف، سیستم دونیت مستقیم از خوانندگان، و محافظت در برابر سرقت محتوا.
          </p>
        </div>
        <CreatorApplicationForm />
      </section>
    </main>
  );
}