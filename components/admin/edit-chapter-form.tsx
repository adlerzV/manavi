"use client";

import { useState, type FormEvent } from "react";
import type { ChapterAccessType } from "@prisma/client";
import { updateChapter } from "@/app/admin/actions/catalog-actions";

interface EditChapterFormProps {
  chapterId: string;
  initialTitle: string | null;
  initialChapterNumber: number;
  initialIsLocked: boolean;
  initialAccessType: ChapterAccessType;
  initialCoinCost: number | null;
}

const ACCESS_TYPE_OPTIONS: { value: ChapterAccessType; label: string }[] = [
  { value: "FREE", label: "رایگان" },
  { value: "COIN_OR_SUBSCRIPTION", label: "سکه یا اشتراک (پیش‌فرض)" },
  { value: "COIN", label: "فقط سکه" },
  { value: "SUBSCRIPTION", label: "فقط اشتراک ویژه" },
];

export function EditChapterForm({
  chapterId,
  initialTitle,
  initialChapterNumber,
  initialIsLocked,
  initialAccessType,
  initialCoinCost,
}: EditChapterFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [chapterNumber, setChapterNumber] = useState(String(initialChapterNumber));
  const [isLocked, setIsLocked] = useState(initialIsLocked);
  const [accessType, setAccessType] = useState<ChapterAccessType>(initialAccessType);
  const [coinCost, setCoinCost] = useState(initialCoinCost != null ? String(initialCoinCost) : "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const needsCoinCost = accessType === "COIN" || accessType === "COIN_OR_SUBSCRIPTION";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updateChapter(chapterId, {
      title: title || undefined,
      chapterNumber: Number(chapterNumber),
      isLocked,
      accessType,
      coinCost: needsCoinCost && coinCost ? Number(coinCost) : null,
    });

    setStatus(result.success ? "done" : "error");
    if (!result.success) setError(result.error ?? "خطا");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-text-muted underline decoration-dotted">
        ویرایش اطلاعات چپتر
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2 rounded-md bg-background p-2">
      <div className="space-y-1">
        <label className="text-xs text-text-muted" htmlFor={`ch-num-${chapterId}`}>شماره چپتر</label>
        <input id={`ch-num-${chapterId}`} type="number" step="0.1" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} required className="w-24 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-text-muted" htmlFor={`ch-title-${chapterId}`}>عنوان (اختیاری)</label>
        <input id={`ch-title-${chapterId}`} value={title} onChange={(e) => setTitle(e.target.value)} className="w-40 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main" />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-text-muted" htmlFor={`ch-access-${chapterId}`}>نوع دسترسی</label>
        <select
          id={`ch-access-${chapterId}`}
          value={accessType}
          onChange={(e) => setAccessType(e.target.value as ChapterAccessType)}
          className="w-44 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main"
        >
          {ACCESS_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {needsCoinCost && (
        <div className="space-y-1">
          <label className="text-xs text-text-muted" htmlFor={`ch-coin-${chapterId}`}>قیمت (سکه)</label>
          <input
            id={`ch-coin-${chapterId}`}
            type="number"
            min={0}
            placeholder="پیش‌فرض سایت"
            value={coinCost}
            onChange={(e) => setCoinCost(e.target.value)}
            className="w-28 rounded-md border border-border bg-surface px-2 py-1 text-xs text-text-main"
          />
        </div>
      )}
      <label className="flex items-center gap-1.5 pb-1.5 text-xs text-text-muted">
        <input type="checkbox" checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} />
        قفل دستی
      </label>
      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "…" : "ذخیره"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-border px-3 py-1 text-xs text-text-muted">
        بستن
      </button>
      {status === "error" && <span className="text-xs text-red-400">{error}</span>}
      {status === "done" && <span className="text-xs text-primary">ذخیره شد</span>}
    </form>
  );
}