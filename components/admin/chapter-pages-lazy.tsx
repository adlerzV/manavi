"use client";

import { useState } from "react";
import { getChapterPagePreviews } from "@/app/admin/actions/chapter-lifecycle";
import { ChapterPagesManager } from "./chapter-pages-manager";

interface ChapterPagesLazyProps {
  chapterId: string;
  pageKeys: string[];
}

export function ChapterPagesLazy({ chapterId, pageKeys }: ChapterPagesLazyProps) {
  const [open, setOpen] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleOpen() {
    setOpen(true);
    if (previewUrls !== null) return;
    if (pageKeys.length === 0) {
      setPreviewUrls([]);
      return;
    }
    setStatus("loading");
    const result = await getChapterPagePreviews(chapterId);
    if (result.success && result.data) {
      setPreviewUrls(result.data.previewUrls);
      setStatus("idle");
    } else {
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={handleOpen} className="text-xs text-text-muted underline decoration-dotted">
        نمایش {pageKeys.length.toLocaleString("fa-IR")} صفحه
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={() => setOpen(false)} className="text-xs text-text-muted underline decoration-dotted">
        بستن صفحات
      </button>
      {status === "loading" && <p className="text-xs text-text-muted">در حال بارگذاری پیش‌نمایش صفحات…</p>}
      {status === "error" && <p className="text-xs text-red-400">خطا در بارگذاری پیش‌نمایش صفحات</p>}
      {previewUrls && <ChapterPagesManager chapterId={chapterId} pageKeys={pageKeys} previewUrls={previewUrls} />}
    </div>
  );
}