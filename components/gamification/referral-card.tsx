"use client";

import { useState } from "react";

interface ReferralCardProps {
  referralLink: string | null;
  referralCode: string;
  referralCount: number;
}

export function ReferralCard({ referralLink, referralCode, referralCount }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
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
        <button onClick={handleCopy} className="text-xs font-medium text-primary">
          {copied ? "کپی شد" : "کپی کد"}
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