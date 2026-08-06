"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HalftoneOverlay } from "./halftone-overlay";
import { GlowCtaButton } from "./glow-cta-button";
import type { TelegramLinks } from "@/lib/site-config";

interface ReaderPreviewProps {
  links: TelegramLinks | null;
}

const PANEL_TONES = [
  "linear-gradient(160deg, #0f2f1f, #00DC64)",
  "linear-gradient(160deg, #1c1030, #EC4899)",
  "linear-gradient(160deg, #101826, #22c55e)",
  "linear-gradient(160deg, #23101c, #f472b6)",
  "linear-gradient(160deg, #0d2418, #16a34a)",
];

function PanelStrip() {
  return (
    <>
      {PANEL_TONES.map((tone, index) => (
        <div key={index} className="relative h-40 w-full flex-shrink-0 overflow-hidden" style={{ backgroundImage: tone }}>
          <HalftoneOverlay dotColor="255,255,255" opacity={0.14} gap={9} dotSize={1} />
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(100deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 12px)",
            }}
          />
        </div>
      ))}
    </>
  );
}

export function ReaderPreview({ links }: ReaderPreviewProps) {
  const shouldReduceMotion = useReducedMotion();

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
            <div className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-neutral-700" />
            <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-black">
              <motion.div
                className="flex flex-col will-change-transform"
                animate={shouldReduceMotion ? undefined : { y: ["0%", "-50%"] }}
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 14, repeat: Infinity, ease: "linear" }
                }
              >
                <PanelStrip />
                <PanelStrip />
              </motion.div>
              <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}