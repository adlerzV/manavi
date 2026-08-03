"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

function StatItem({ label, value }: { label: string; value: number }) {
  const animated = useCountUp(value);
  return (
    <div className="flex flex-col items-center gap-1 rounded-md border border-border bg-surface p-6 text-center">
      <p className="text-2xl font-semibold text-primary">{animated.toLocaleString("fa-IR")}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}

export interface LiveStatsProps {
  readerCount: number;
  comicCount: number;
  totalDonationsToman: number;
}

export function LiveStats({ readerCount, comicCount, totalDonationsToman }: LiveStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatItem label="خواننده" value={readerCount} />
      <StatItem label="اثر منتشرشده" value={comicCount} />
      <StatItem label="تومان حمایت پرداخت‌شده به آرتیست‌ها" value={totalDonationsToman} />
    </div>
  );
}