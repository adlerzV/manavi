"use client";

import { useState } from "react";

interface ReaderProgressBarProps {
  currentPage: number;
  totalPages: number;
  onJump: (page: number) => void;
  visible: boolean;
}

export function ReaderProgressBar({ currentPage, totalPages, onJump, visible }: ReaderProgressBarProps) {
  const [expanded, setExpanded] = useState(false);
  const percent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className={`fixed inset-x-0 top-[52px] z-30 transition-transform duration-200 ${visible ? "translate-y-0" : "-translate-y-full"}`}>
      <button onClick={() => setExpanded((p) => !p)} className="block h-1 w-full bg-white/10">
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </button>
      {expanded && (
        <div className="flex items-center gap-3 bg-black/80 px-4 py-2 backdrop-blur-sm">
          <span className="w-14 shrink-0 text-xs text-white/70">{currentPage} / {totalPages}</span>
          <input type="range" min={1} max={totalPages} value={currentPage} onChange={(e) => onJump(Number(e.target.value))} className="h-1.5 flex-1 accent-primary" />
          <span className="w-10 shrink-0 text-right text-xs text-white/70">{percent}%</span>
        </div>
      )}
    </div>
  );
}