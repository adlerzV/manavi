"use client";

import { useState, useTransition } from "react";
import { claimDailyCheckin } from "@/app/actions/checkin";

export function FloatingDailyClaim({ alreadyClaimedToday }: { alreadyClaimedToday: boolean }) {
  const [claimed, setClaimed] = useState(alreadyClaimedToday);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (claimed) return null;

  function handleClaim() {
    startTransition(async () => {
      const result = await claimDailyCheckin();
      if (result.success && !result.alreadyClaimedToday) {
        setMessage(`+${result.coinsAwarded} سکه`);
        setTimeout(() => setClaimed(true), 900);
      } else if (result.success) {
        setClaimed(true);
      }
    });
  }

  return (
    <button
      onClick={handleClaim}
      disabled={isPending}
      className="fixed bottom-[calc(88px+env(safe-area-inset-bottom))] right-4 z-30 animate-bounce rounded-full bg-accent px-4 py-2.5 text-xs font-medium text-accent-foreground shadow-lg disabled:opacity-70"
    >
      {message ?? "🎁 سکه روزانه!"}
    </button>
  );
}