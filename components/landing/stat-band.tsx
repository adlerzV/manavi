"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { SiteStats } from "@/lib/site-stats";

function useCountUp(target: number, durationMs = 1400) {
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

interface StatItemProps {
  label: string;
  value: number;
}

function StatItem({ label, value }: StatItemProps) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 text-center backdrop-blur-sm transition-colors hover:border-primary/40"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <p className="text-3xl font-extrabold text-primary sm:text-4xl">{animated.toLocaleString("fa-IR")}</p>
      <p className="mt-2 text-xs text-text-muted sm:text-sm">{label}</p>
    </motion.div>
  );
}

interface StatBandProps {
  stats: SiteStats;
}

export function StatBand({ stats }: StatBandProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatItem label="خواننده فعال" value={stats.readerCount} />
        <StatItem label="اثر منتشرشده" value={stats.comicCount} />
        <StatItem label="تومان حمایت پرداخت‌شده به آرتیست‌ها" value={stats.totalDonationsToman} />
      </div>
    </section>
  );
}