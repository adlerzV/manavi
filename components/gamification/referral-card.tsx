"use client";

import { useState } from "react";

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
    if (!referralLink) return;
    const ok = await copyText(referralLink);
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
        به ازای هر دوستی که با لینک شما بیاید، ۱۰ سکه هدیه می‌گیرید.
      </p>

      <div className="mb-3 flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
        <span className="truncate text-xs text-text-muted">{referralCode}</span>
        <button onClick={handleCopy} disabled={!referralLink} className="whitespace-nowrap text-xs font-medium text-primary disabled:opacity-50">
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

      <p className="mt-3 text-center text-xs text-text-muted">{referralCount} نفر دعوت کرده‌اید</p>
    </div>
  );
}