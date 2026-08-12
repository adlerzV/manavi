import type { SiteStats } from "@/lib/site-stats";

interface StatBandProps {
  stats: SiteStats;
}

export function StatBand({ stats }: StatBandProps) {
  const items = [
    { label: "خواننده فعال", value: stats.readerCount },
    { label: "اثر منتشرشده", value: stats.comicCount },
    { label: "چپتر منتشرشده", value: stats.chapterCount },
  ];

  return (
    <section id="stats" className="relative mx-auto max-w-6xl px-4 py-16">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 text-center backdrop-blur-sm transition-colors hover:border-primary/40"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <p className="text-3xl font-extrabold text-primary sm:text-4xl">{item.value.toLocaleString("fa-IR")}</p>
            <p className="mt-2 text-xs text-text-muted sm:text-sm">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}