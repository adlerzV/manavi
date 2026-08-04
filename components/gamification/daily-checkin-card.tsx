"use client";

import { useState, useTransition } from "react";
import { claimDailyCheckin } from "@/app/actions/checkin";
import { STREAK_CYCLE_LENGTH } from "@/lib/gamification";

interface DailyCheckinCardProps {
  currentStreak: number;
  alreadyClaimedToday: boolean;
}

export function DailyCheckinCard({ currentStreak, alreadyClaimedToday }: DailyCheckinCardProps) {
  const [streak, setStreak] = useState(currentStreak);
  const [claimed, setClaimed] = useState(alreadyClaimedToday);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClaim() {
    if (claimed || isPending) return;
    startTransition(async () => {
      const result = await claimDailyCheckin();
      if (result.success && !result.alreadyClaimedToday) {
        setStreak(result.streak ?? streak);
        setClaimed(true);
        setMessage(`${result.coinsAwarded} سکه دریافت کردید`);
      } else if (result.success) {
        setClaimed(true);
      } else if (result.error) {
        setMessage(result.error);
      }
    });
  }

  const dayInCycle = streak === 0 ? 0 : ((streak - 1) % STREAK_CYCLE_LENGTH) + 1;

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-text-main">ورود روزانه</h3>
        <span className="text-xs text-text-muted">
          روز {dayInCycle} از {STREAK_CYCLE_LENGTH}
        </span>
      </div>

      <div className="mb-4 flex gap-1.5">
        {Array.from({ length: STREAK_CYCLE_LENGTH }).map((_, i) => {
          const dayNumber = i + 1;
          const filled = dayNumber <= dayInCycle;
          return (
            <div
              key={i}
              className={`h-7 flex-1 rounded-md text-center text-xs leading-7 ${
                filled ? "bg-primary text-primary-foreground" : "bg-background text-text-muted"
              }`}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed || isPending}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {claimed ? "امروز دریافت شد" : isPending ? "در حال دریافت…" : "دریافت جایزه امروز"}
      </button>

      {message && <p className="mt-2 text-center text-xs text-text-muted">{message}</p>}
    </div>
  );
}