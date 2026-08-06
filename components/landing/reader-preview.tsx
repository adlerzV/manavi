import { GlowCtaButton } from "./glow-cta-button";
import { ReaderPreviewMarquee } from "./reader-preview-marquee";
import type { TelegramLinks } from "@/lib/site-config";

interface ReaderPreviewProps {
  links: TelegramLinks | null;
  panelImageSrc?: string;
}

export function ReaderPreview({
  links,
  panelImageSrc = "/images/hero/ch_1_2.jpg",
}: ReaderPreviewProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
        <div className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-right">
          <span className="text-xs font-medium tracking-widest text-primary">تجربه خواندن</span>
          <h2 className="mt-3 max-w-md text-2xl font-bold leading-relaxed text-text-main sm:text-3xl">
            بخون، اسکرول کن، غرق شو
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-8 text-text-muted">
            ریدر مانوی برای خوندن پشت‌سرهم ساخته شده؛ صفحه‌ها نرم زیر انگشتت رد می‌شن،
            بدون قطع‌شدن، بدون معطلی برای بارگذاری.
          </p>
          <div className="mt-8">
            <GlowCtaButton href={links?.webLink} nativeHref={links?.nativeLink}>
              همین الان شروع به خواندن کن
            </GlowCtaButton>
          </div>
        </div>

        <div className="order-1 mx-auto md:order-2">
          <div className="relative mx-auto h-[520px] w-[260px] rounded-[2.5rem] border-[6px] border-neutral-800 bg-neutral-900 shadow-2xl">
            <div className="absolute left-1/2 top-2 z-20 h-1.5 w-16 -translate-x-1/2 rounded-full bg-neutral-700" />

            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
              <ReaderPreviewMarquee panelImageSrc={panelImageSrc} />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}