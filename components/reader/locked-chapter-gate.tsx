"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { ChapterAccessType } from "@prisma/client";
import { unlockChapterWithCoins } from "@/app/actions/chapter-access";

interface LockedChapterGateProps {
  chapterId: string;
  comicSlug: string;
  coinsBalance: number;
  accessType: ChapterAccessType;
  coinCost: number;
}

export function LockedChapterGate({
  chapterId,
  comicSlug,
  coinsBalance,
  accessType,
  coinCost,
}: LockedChapterGateProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCoinUnlock() {
    setPending(true);
    setError(null);
    const result = await unlockChapterWithCoins(chapterId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "خطا در باز کردن چپتر");
    }
    setPending(false);
  }

  const showSubscription = accessType === "SUBSCRIPTION" || accessType === "COIN_OR_SUBSCRIPTION";
  const showCoinOptions = accessType === "COIN" || accessType === "COIN_OR_SUBSCRIPTION";
  const returnTo = `/app/read/${chapterId}`;
  const shortfall = Math.max(0, coinCost - coinsBalance);
  const hasEnoughCoins = coinsBalance >= coinCost;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-lg font-medium text-text-main">
        {accessType === "SUBSCRIPTION" ? "این چپتر مخصوص مشترکین ویژه است" : "این چپتر مخصوص مشترکین است"}
      </p>
      <p className="max-w-sm text-sm text-text-muted">
        {accessType === "SUBSCRIPTION"
          ? "برای خواندن این چپتر، اشتراک ویژه تهیه کنید."
          : "برای خواندن این چپتر، اشتراک ویژه تهیه کنید یا با سکه باز کنید."}
      </p>

      {showSubscription && (
        <Link
          href={`/app/shop?tab=subscriptions&redirect=${encodeURIComponent(returnTo)}`}
          className="w-full max-w-xs rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          تهیه اشتراک ویژه
        </Link>
      )}

      {showCoinOptions && (
        hasEnoughCoins ? (
          <button
            onClick={handleCoinUnlock}
            disabled={pending}
            className="w-full max-w-xs rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent disabled:opacity-50"
          >
            {pending ? "در حال پرداخت…" : `پرداخت ${coinCost.toLocaleString("fa-IR")} سکه و خواندن`}
          </button>
        ) : (
          <Link
            href={`/app/shop?tab=coins&redirect=${encodeURIComponent(returnTo)}`}
            className="w-full max-w-xs rounded-md border border-accent px-4 py-2 text-center text-sm font-medium text-accent"
          >
            خرید سکه (کسری: {shortfall.toLocaleString("fa-IR")} سکه)
          </Link>
        )
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}