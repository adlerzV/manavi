"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { unlockComicWithCoins } from "@/app/actions/chapter-access";

interface ComicUnlockButtonProps {
  comicId: string;
  lockedCount: number;
  totalCost: number;
  authenticated: boolean;
  coinsBalance: number;
}

export function ComicUnlockButton({ comicId, lockedCount, totalCost, authenticated, coinsBalance }: ComicUnlockButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasEnough = coinsBalance >= totalCost;

  async function handleUnlock() {
    if (!confirm(`باز کردن ${lockedCount.toLocaleString("fa-IR")} چپتر قفل‌شده با ${totalCost.toLocaleString("fa-IR")} سکه؟`)) return;
    setPending(true);
    setError(null);
    const result = await unlockComicWithCoins(comicId);
    if (result.success) {
      router.refresh();
    } else {
      setError(result.error ?? "خطا در باز کردن");
    }
    setPending(false);
  }

  if (!authenticated) {
    return (
      <p className="rounded-md border border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        برای باز کردن کل عنوان یکجا، از داخل تلگرام وارد شوید.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {hasEnough ? (
        <button
          onClick={handleUnlock}
          disabled={pending}
          className="w-full rounded-md border border-accent px-4 py-3 text-sm font-medium text-accent disabled:opacity-50"
        >
          {pending ? "در حال باز کردن…" : `باز کردن همه (${lockedCount.toLocaleString("fa-IR")} چپتر) با ${totalCost.toLocaleString("fa-IR")} سکه`}
        </button>
      ) : (
        <Link
          href="/app/shop"
          className="block w-full rounded-md border border-accent px-4 py-3 text-center text-sm font-medium text-accent"
        >
          باز کردن همه ({lockedCount.toLocaleString("fa-IR")} چپتر) — نیاز به {totalCost.toLocaleString("fa-IR")} سکه، موجودی کافی نیست
        </Link>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}