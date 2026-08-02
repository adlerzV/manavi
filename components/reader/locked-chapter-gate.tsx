"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { unlockChapterWithCoins } from "@/app/actions/chapter-access";
import { COIN_CHAPTER_UNLOCK_COST } from "@/lib/billing";
import { RewardedAdButton } from "./rewarded-ad-button";

export function LockedChapterGate({ chapterId, coinsBalance }: { chapterId: string; coinsBalance: number }) {
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-lg font-medium text-text-main">این چپتر مخصوص مشترکین است</p>
      <p className="max-w-sm text-sm text-text-muted">
        برای خواندن ۱۰ چپتر آخر هر عنوان، اشتراک ویژه تهیه کنید یا از روش‌های زیر استفاده کنید.
      </p>

      <Link
        href="/app/shop"
        className="w-full max-w-xs rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        تهیه اشتراک ویژه
      </Link>

      <div className="w-full max-w-xs">
        <RewardedAdButton chapterId={chapterId} onUnlocked={refresh} />
      </div>

      <button
        onClick={handleCoinUnlock}
        disabled={pending || coinsBalance < COIN_CHAPTER_UNLOCK_COST}
        className="w-full max-w-xs rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent disabled:opacity-50"
      >
        باز کردن با {COIN_CHAPTER_UNLOCK_COST} سکه (موجودی: {coinsBalance})
      </button>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}