"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import type { ProfileLink } from "@/lib/profile-links";

interface WalletAndLinksProps {
  cryptoWalletLabel: string | null;
  cryptoWalletAddress: string | null;
  customLinks: ProfileLink[];
}

export function WalletAndLinks({ cryptoWalletLabel, cryptoWalletAddress, customLinks }: WalletAndLinksProps) {
  const [copied, setCopied] = useState(false);

  if (!cryptoWalletAddress && customLinks.length === 0) return null;

  async function handleCopy() {
    if (!cryptoWalletAddress) return;
    const ok = await copyText(cryptoWalletAddress);
    setCopied(ok);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-3 space-y-2">
      {cryptoWalletAddress && (
        <div className="flex items-center justify-between gap-2 rounded-md bg-background px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs text-text-muted">{cryptoWalletLabel || "کیف پول ارزی"}</p>
            <p className="truncate text-xs text-text-main">{cryptoWalletAddress}</p>
          </div>
          <button onClick={handleCopy} className="flex-shrink-0 whitespace-nowrap text-xs font-medium text-primary">
            {copied ? "کپی شد" : "کپی آدرس"}
          </button>
        </div>
      )}
      {customLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customLinks.map((link, i) => (
            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="rounded-md border border-border px-3 py-1.5 text-xs text-text-main hover:border-primary">
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}