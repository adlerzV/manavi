"use client";

import { useState } from "react";
import { unlockChapterWithAd } from "@/app/actions/chapter-access";

export function RewardedAdButton({ chapterId, onUnlocked }: { chapterId: string; onUnlocked: () => void }) {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const blockId = process.env.NEXT_PUBLIC_ADSGRAM_BLOCK_ID;

  async function handleClick() {
    if (!blockId || !window.Adsgram) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const controller = window.Adsgram.init({ blockId });
      await controller.show();
      const result = await unlockChapterWithAd(chapterId);
      if (result.success) {
        onUnlocked();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("idle");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className="w-full rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-text-main disabled:opacity-50"
    >
      {status === "loading" ? "در حال بارگذاری تبلیغ..." : "با دیدن یک تبلیغ کوتاه، این چپتر را باز کن"}
      {status === "error" && (
        <span className="mt-1 block text-xs text-red-400">
          تبلیغی برای نمایش موجود نیست، بعداً دوباره امتحان کنید
        </span>
      )}
    </button>
  );
}