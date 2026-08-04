"use client";

import { useState, type ReactNode } from "react";

interface ComicDetailTabsProps {
  preview: ReactNode;
  episodes: ReactNode;
  similar: ReactNode;
  episodeCount: number;
}

const TABS = [
  { id: "preview", label: "پیش‌نمایش" },
  { id: "episodes", label: "قسمت‌ها" },
  { id: "similar", label: "مشابه" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ComicDetailTabs({ preview, episodes, similar, episodeCount }: ComicDetailTabsProps) {
  const [active, setActive] = useState<TabId>("preview");

  return (
    <div>
      <div className="sticky top-0 z-10 -mx-4 flex border-b border-border bg-background/95 px-4 backdrop-blur-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
              active === tab.id ? "text-primary" : "text-text-muted"
            }`}
          >
            {tab.label}
            {tab.id === "episodes" && episodeCount > 0 && (
              <span className="mr-1 text-xs text-text-muted">({episodeCount.toLocaleString("fa-IR")})</span>
            )}
            {active === tab.id && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {active === "preview" && preview}
        {active === "episodes" && episodes}
        {active === "similar" && similar}
      </div>
    </div>
  );
}