"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { ChapterAccessType } from "@prisma/client";
import { unlockChapterWithCoins } from "@/app/actions/chapter-access";
import { RewardedAdButton } from "./rewarded-ad-button";

interface LockedChapterGateProps {
  chapterId: string;
  coinsBalance: number;
  accessType: ChapterAccessType;
  coinCost: number;
}

export function LockedChapterGate({ chapterId, coinsBalance, accessType, coinCost }: LockedChapterGateProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    router.refresh();
  }

  async function handleCoinUnlock() {
    setPending(true);
    setError(null);
    const result = await unlockChapterWithCoins(chapterId);
    if (result.success) {
      refresh();
    } else {
      setError(result.error ?? "خطا در باز کردن چپتر");
    }
    setPending(false);
  }

  const showSubscription = accessType === "SUBSCRIPTION" || accessType === "COIN_OR_SUBSCRIPTION";
  const showCoinOptions = accessType === "COIN" || accessType === "COIN_OR_SUBSCRIPTION";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-lg font-medium text-text-main">
        {accessType === "SUBSCRIPTION" ? "این چپتر مخصوص مشترکین ویژه است" : "این چپتر مخصوص مشترکین است"}
      </p>
      <p className="max-w-sm text-sm text-text-muted">
        {accessType === "SUBSCRIPTION"
          ? "برای خواندن این چپتر، اشتراک ویژه تهیه کنید."
          : "برای خواندن ۱۰ چپتر آخر هر عنوان، اشتراک ویژه تهیه کنید یا از روش‌های زیر استفاده کنید."}
      </p>

      {showSubscription && (
        <Link
          href="/app/shop"
          className="w-full max-w-xs rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          تهیه اشتراک ویژه
        </Link>
      )}

      {showCoinOptions && (
        <>
          <div className="w-full max-w-xs">
            <RewardedAdButton chapterId={chapterId} onUnlocked={refresh} />
          </div>

          <button
            onClick={handleCoinUnlock}
            disabled={pending || coinsBalance < coinCost}
            className="w-full max-w-xs rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent disabled:opacity-50"
          >
            باز کردن با {coinCost.toLocaleString("fa-IR")} سکه (موجودی: {coinsBalance.toLocaleString("fa-IR")})
          </button>
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}