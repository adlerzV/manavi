"use client";

import type { ChapterAccessType } from "@prisma/client";

export type ChapterAccessFilterValue = "ALL" | ChapterAccessType;

interface ChapterAccessFilterTabsProps {
  value: ChapterAccessFilterValue;
  onChange: (value: ChapterAccessFilterValue) => void;
  counts: Record<ChapterAccessFilterValue, number>;
}

const FILTERS: { value: ChapterAccessFilterValue; label: string }[] = [
  { value: "ALL", label: "همه" },
  { value: "FREE", label: "رایگان" },
  { value: "COIN", label: "سکه‌ای" },
];

export function ChapterAccessFilterTabs({ value, onChange, counts }: ChapterAccessFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const count = counts[filter.value] ?? 0;
        const active = value === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-text-muted"
            }`}
          >
            {filter.label}
            <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-primary/20" : "bg-background"}`}>
              {count.toLocaleString("fa-IR")}
            </span>
          </button>
        );
      })}
    </div>
  );
}