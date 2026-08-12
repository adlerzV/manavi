"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { FilterDrawer } from "./filter-drawer";

interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
}

interface GenreFilterOption {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, string> = {
  ONGOING: "در حال انتشار",
  COMPLETED: "پایان‌یافته",
  HIATUS: "متوقف‌شده",
};

interface ExploreSearchClientProps {
  categories: CategoryFilterOption[];
  genres: GenreFilterOption[];
}

export function ExploreSearchClient({ categories, genres }: ExploreSearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [queryInput, setQueryInput] = useState(searchParams.get("q") ?? "");

  const type = searchParams.get("type");
  const genreIdsParam = searchParams.get("genres");
  const genreIds = useMemo(() => (genreIdsParam ? genreIdsParam.split(",").filter(Boolean) : []), [genreIdsParam]);
  const status = searchParams.get("status");
  const q = searchParams.get("q") ?? "";

  const activeFilterCount = (type ? 1 : 0) + genreIds.length + (status ? 1 : 0);

  function pushParams(next: { q?: string; type?: string | null; genreIds?: string[]; status?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());

    const nextQ = next.q !== undefined ? next.q : q;
    const nextType = next.type !== undefined ? next.type : type;
    const nextGenreIds = next.genreIds !== undefined ? next.genreIds : genreIds;
    const nextStatus = next.status !== undefined ? next.status : status;

    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");

    if (nextType) params.set("type", nextType);
    else params.delete("type");

    if (nextGenreIds.length > 0) params.set("genres", nextGenreIds.join(","));
    else params.delete("genres");

    if (nextStatus) params.set("status", nextStatus);
    else params.delete("status");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    pushParams({ q: queryInput });
  }

  function removeGenre(genreId: string) {
    pushParams({ genreIds: genreIds.filter((id) => id !== genreId) });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="جستجوی عنوان..."
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
        <button type="submit" disabled={isPending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          جستجو
        </button>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="فیلترها"
          className={`relative flex items-center justify-center rounded-md border px-3 py-2 ${
            activeFilterCount > 0 ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface text-text-main"
          }`}
        >
          <SlidersHorizontal size={16} />
          {activeFilterCount > 0 && (
            <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeFilterCount.toLocaleString("fa-IR")}
            </span>
          )}
        </button>
      </form>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {type && (
            <button onClick={() => pushParams({ type: null })} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {categories.find((c) => c.slug === type)?.name ?? type}
              <X size={12} />
            </button>
          )}
          {genreIds.map((genreId) => (
            <button key={genreId} onClick={() => removeGenre(genreId)} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {genres.find((g) => g.id === genreId)?.name ?? "ژانر"}
              <X size={12} />
            </button>
          ))}
          {status && (
            <button onClick={() => pushParams({ status: null })} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
              {STATUS_LABELS[status] ?? status}
              <X size={12} />
            </button>
          )}
          <button onClick={() => pushParams({ type: null, genreIds: [], status: null })} className="text-xs text-text-muted underline decoration-dotted">
            پاک کردن همه
          </button>
        </div>
      )}

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        genres={genres}
        initialType={type}
        initialGenreIds={genreIds}
        initialStatus={status}
        currentQuery={q}
        onApply={(next) => pushParams({ type: next.type, genreIds: next.genreIds, status: next.status })}
      />
    </div>
  );
}