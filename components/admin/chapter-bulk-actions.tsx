"use client";

import { useState } from "react";
import type { ChapterAccessType } from "@prisma/client";
import { bulkUpdateChapterAccessType } from "@/app/admin/actions/catalog-actions";
import { CHAPTER_ACCESS_TYPE_OPTIONS, PUBLISHER_CHAPTER_ACCESS_TYPE_OPTIONS } from "@/lib/chapter-access";

interface ChapterBulkActionsProps {
  selectedIds: string[];
  restrictAccessTypes?: boolean;
  onApplied: () => void;
  onClearSelection: () => void;
}

export function ChapterBulkActions({ selectedIds, restrictAccessTypes, onApplied, onClearSelection }: ChapterBulkActionsProps) {
  const options = restrictAccessTypes ? PUBLISHER_CHAPTER_ACCESS_TYPE_OPTIONS : CHAPTER_ACCESS_TYPE_OPTIONS;
  const [accessType, setAccessType] = useState<ChapterAccessType>(options[0]?.value ?? "FREE");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  async function handleApply() {
    setPending(true);
    setError(null);
    const result = await bulkUpdateChapterAccessType(selectedIds, accessType);
    setPending(false);
    if (result.success) {
      onApplied();
      onClearSelection();
    } else {
      setError(result.error ?? "خطا در اعمال تغییرات");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/40 bg-primary/5 px-3 py-2">
      <span className="text-xs text-text-main">{selectedIds.length.toLocaleString("fa-IR")} مورد انتخاب شده</span>
      <select
        value={accessType}
        onChange={(e) => setAccessType(e.target.value as ChapterAccessType)}
        className="rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleApply}
        disabled={pending}
        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        {pending ? "در حال اعمال…" : `تغییر نوع دسترسی برای ${selectedIds.length.toLocaleString("fa-IR")} مورد`}
      </button>
      <button type="button" onClick={onClearSelection} className="text-xs text-text-muted">
        لغو انتخاب
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}