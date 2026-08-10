"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface CoinBalanceHeaderProps {
  coinsBalance: number;
  subscriptionEnd: string | null;
  authenticated: boolean;
}

export function CoinBalanceHeader({ coinsBalance, subscriptionEnd, authenticated }: CoinBalanceHeaderProps) {
  const [open, setOpen] = useState(false);

  const daysLeft = subscriptionEnd
    ? Math.max(0, Math.ceil((new Date(subscriptionEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="مناوی" width={28} height={28} priority className="rounded-md" />
          <span className="text-sm font-semibold text-text-main">مناوی</span>
        </div>

        <button onClick={() => authenticated && setOpen(true)} disabled={!authenticated} className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text-main disabled:opacity-60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          🪙 {coinsBalance.toLocaleString("fa-IR")}
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-2xl border border-border bg-surface p-6">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                <span className="text-sm text-text-muted">موجودی سکه</span>
                <span className="text-lg font-semibold text-primary">🪙 {coinsBalance.toLocaleString("fa-IR")}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-background px-4 py-3">
                <span className="text-sm text-text-muted">اشتراک ویژه</span>
                <span className="text-sm text-text-main">{daysLeft !== null && daysLeft > 0 ? `${daysLeft.toLocaleString("fa-IR")} روز باقی‌مانده` : "فعال نیست"}</span>
              </div>
              <Link href="/app/shop" onClick={() => setOpen(false)} className="block rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">
                شارژ سکه / تمدید اشتراک
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}