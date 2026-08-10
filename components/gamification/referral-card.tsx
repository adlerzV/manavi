"use client";

import { useState } from "react";
import { REFERRAL_REWARD_COINS } from "@/lib/gamification";

interface ReferralCardProps {
  referralLink: string | null;
  referralCode: string;
  referralCount: number;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    throw new Error("Clipboard API unavailable");
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.top = "0";
      textarea.style.left = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textarea);
      return ok;
    } catch {
      return false;
    }
  }
}

export function ReferralCard({ referralLink, referralCode, referralCount }: ReferralCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    const ok = await copyText(referralCode);
    setCopyState(ok ? "copied" : "error");
    setTimeout(() => setCopyState("idle"), 2000);
  }

  const shareUrl = referralLink
    ? `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
        "بیا با هم مانهوا و مانگا بخونیم!"
      )}`
    : null;

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <h3 className="mb-1 text-sm font-medium text-text-main">دعوت از دوستان</h3>
      <p className="mb-3 text-xs text-text-muted">
        وقتی دوستتان با لینک شما بیاید و یک اشتراک ویژه فعال کند، {REFERRAL_REWARD_COINS.toLocaleString("fa-IR")} سکه هدیه می‌گیرید.
      </p>

      <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
        <span className="truncate text-xs text-text-muted">{referralCode}</span>
        <button onClick={handleCopy} className="whitespace-nowrap text-xs font-medium text-primary">
          {copyState === "copied" ? "کپی شد" : copyState === "error" ? "کپی نشد، دستی کپی کنید" : "کپی کد"}
        </button>
      </div>

      {shareUrl && (
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-md bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground"
        >
          اشتراک‌گذاری در تلگرام
        </a>
      )}

      <p className="mt-3 text-center text-xs text-text-muted">{referralCount.toLocaleString("fa-IR")} دعوت موفق (با اشتراک فعال)</p>
    </div>
  );
}