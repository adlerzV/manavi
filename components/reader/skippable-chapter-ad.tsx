"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const AD_HEIGHT_VH = 20;
const SKIP_UNLOCK_DELAY_MS = 5000;

interface SkippableChapterAdProps {
  onSkip: () => void;
  onContinue: () => void;
}

export function SkippableChapterAd({ onSkip, onContinue }: SkippableChapterAdProps) {
  const blockId = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(SKIP_UNLOCK_DELAY_MS / 1000));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (!blockId) {
      setStatus("error");
      return;
    }
    if (!scriptLoaded || !window.Adsgram) return;
    try {
      const controller = window.Adsgram.init({ blockId });
      controller
        .show()
        .then(() => setStatus("ready"))
        .catch(() => setStatus("error"));
    } catch {
      setStatus("error");
    }
  }, [scriptLoaded, blockId]);

  const canSkip = secondsLeft <= 0;

  return (
    <div style={{ height: `${AD_HEIGHT_VH}vh` }} className="relative w-full overflow-hidden border-t border-white/10 bg-black">
      <Script
        src="https://sad.adsgram.ai/js/sad.min.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
        onError={() => setStatus("error")}
      />

      <div className="flex h-full w-full items-center justify-center">
        {status === "loading" && <p className="text-xs text-white/50">در حال بارگذاری تبلیغ…</p>}
        {status === "error" && <p className="text-xs text-white/50">تبلیغی برای نمایش موجود نیست</p>}
      </div>

      <button
        onClick={canSkip ? onSkip : undefined}
        disabled={!canSkip}
        className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1.5 text-xs text-white backdrop-blur-sm disabled:opacity-60"
      >
        {canSkip ? "رد کردن ✕" : `رد کردن (${secondsLeft})`}
      </button>

      <button
        onClick={onContinue}
        className="absolute bottom-3 right-3 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
      >
        ادامه به چپتر بعد
      </button>
    </div>
  );
}