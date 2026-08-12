"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { getExploreResultsCount } from "@/app/actions/explore-filters";

interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
}

interface GenreFilterOption {
  id: string;
  name: string;
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryFilterOption[];
  genres: GenreFilterOption[];
  initialType: string | null;
  initialGenreIds: string[];
  initialStatus: string | null;
  currentQuery: string;
  onApply: (next: { type: string | null; genreIds: string[]; status: string | null }) => void;
}

const STATUS_OPTIONS: { value: "ONGOING" | "COMPLETED" | "HIATUS"; label: string }[] = [
  { value: "ONGOING", label: "در حال انتشار" },
  { value: "COMPLETED", label: "پایان‌یافته" },
  { value: "HIATUS", label: "متوقف‌شده" },
];

const COUNT_DEBOUNCE_MS = 400;

export function FilterDrawer({
  open,
  onClose,
  categories,
  genres,
  initialType,
  initialGenreIds,
  initialStatus,
  currentQuery,
  onApply,
}: FilterDrawerProps) {
  const [type, setType] = useState<string | null>(initialType);
  const [genreIds, setGenreIds] = useState<string[]>(initialGenreIds);
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [count, setCount] = useState<number | null>(null);
  const [loadingCount, setLoadingCount] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    setType(initialType);
    setGenreIds(initialGenreIds);
    setStatus(initialStatus);
  }, [open, initialType, initialGenreIds, initialStatus]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoadingCount(true);
    const requestId = ++requestIdRef.current;
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await getExploreResultsCount({
          q: currentQuery,
          categorySlug: type ?? undefined,
          genreIds,
          status: (status as "ONGOING" | "COMPLETED" | "HIATUS" | null) ?? undefined,
        });
        if (requestId === requestIdRef.current) setCount(result);
      } finally {
        if (requestId === requestIdRef.current) setLoadingCount(false);
      }
    }, COUNT_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [open, type, genreIds, status, currentQuery]);

  function toggleGenre(genreId: string) {
    setGenreIds((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]));
  }

  function handleReset() {
    setType(null);
    setGenreIds([]);
    setStatus(null);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-border bg-surface">
        <div className="flex justify-center pt-2">
          <span className="h-1 w-10 rounded-full bg-border" />
        </div>

        <div className="flex items-center justify-between px-4 pt-2">
          <h2 className="text-sm font-medium text-text-main">فیلترها</h2>
          <button onClick={onClose} aria-label="بستن" className="rounded-full p-1.5 text-text-muted hover:bg-background">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-4 py-4">
          {categories.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-text-muted">نوع اثر</h3>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setType(null)} className={`rounded-full border px-3 py-1.5 text-xs ${type === null ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"}`}>
                  همه
                </button>
                {categories.map((category) => (
                  <button key={category.id} type="button" onClick={() => setType(category.slug)} className={`rounded-full border px-3 py-1.5 text-xs ${type === category.slug ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"}`}>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border" />

          {genres.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-text-muted">ژانرها</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => {
                  const selected = genreIds.includes(genre.id);
                  return (
                    <button key={genre.id} type="button" onClick={() => toggleGenre(genre.id)} className={`rounded-full border px-3 py-1.5 text-xs ${selected ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"}`}>
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-border" />

          <div className="space-y-2">
            <h3 className="text-xs font-medium text-text-muted">وضعیت انتشار</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setStatus(null)} className={`rounded-full border px-3 py-1.5 text-xs ${status === null ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"}`}>
                همه
              </button>
              {STATUS_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => setStatus(option.value)} className={`rounded-full border px-3 py-1.5 text-xs ${status === option.value ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }} className="sticky bottom-0 flex items-center gap-2 border-t border-border bg-surface px-4 pt-3">
          <button type="button" onClick={handleReset} className="rounded-md border border-border px-4 py-2.5 text-sm text-text-muted">
            بازنشانی
          </button>

          <button
            type="button"
            onClick={() => {
              onApply({ type, genreIds, status });
              onClose();
            }}
            className="flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            {loadingCount ? "در حال محاسبه…" : count !== null ? `نمایش ${count.toLocaleString("fa-IR")} اثر` : "اعمال فیلتر"}
          </button>
        </div>
      </div>
    </div>
  );
}