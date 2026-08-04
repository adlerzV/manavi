"use client";

import type { ReadingMode } from "@prisma/client";

interface ReadingModeToggleProps {
  mode: ReadingMode;
  onChange: (mode: ReadingMode) => void;
}

export function ReadingModeToggle({ mode, onChange }: ReadingModeToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-black/40 p-1">
      <button onClick={() => onChange("VERTICAL")} aria-label="حالت اسکرول عمودی" className={`flex h-7 w-7 items-center justify-center rounded-full ${mode === "VERTICAL" ? "bg-white/20 text-white" : "text-white/50"}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="3" width="14" height="6" rx="1" />
          <rect x="5" y="15" width="14" height="6" rx="1" />
        </svg>
      </button>
      <button onClick={() => onChange("HORIZONTAL")} aria-label="حالت صفحه‌بندی افقی" className={`flex h-7 w-7 items-center justify-center rounded-full ${mode === "HORIZONTAL" ? "bg-white/20 text-white" : "text-white/50"}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="5" width="6" height="14" rx="1" />
          <rect x="15" y="5" width="6" height="14" rx="1" />
        </svg>
      </button>
      <button onClick={() => onChange("DOUBLE_PAGE")} aria-label="حالت دو صفحه‌ای" className={`hidden h-7 w-7 items-center justify-center rounded-full sm:flex ${mode === "DOUBLE_PAGE" ? "bg-white/20 text-white" : "text-white/50"}`}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="5" width="9" height="14" rx="1" />
          <rect x="13" y="5" width="9" height="14" rx="1" />
        </svg>
      </button>
    </div>
  );
}