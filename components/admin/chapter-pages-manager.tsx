"use client";

import { useState, type DragEvent } from "react";
import { reorderChapterPages } from "@/app/admin/actions/chapter-lifecycle";
import { removeChapterPage } from "@/app/admin/actions/catalog-actions";

interface ChapterPagesManagerProps {
  chapterId: string;
  pageKeys: string[];
  previewUrls: string[];
}

export function ChapterPagesManager({ chapterId, pageKeys, previewUrls }: ChapterPagesManagerProps) {
  const [keys, setKeys] = useState(pageKeys);
  const [previews, setPreviews] = useState(previewUrls);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  async function persistOrder(nextKeys: string[]) {
    setPending(true);
    const result = await reorderChapterPages(chapterId, nextKeys);
    if (!result.success) {
      setKeys(pageKeys);
      setPreviews(previewUrls);
    }
    setPending(false);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    const nextKeys = [...keys];
    const nextPreviews = [...previews];
    const [movedKey] = nextKeys.splice(dragIndex, 1);
    const [movedPreview] = nextPreviews.splice(dragIndex, 1);
    nextKeys.splice(index, 0, movedKey);
    nextPreviews.splice(index, 0, movedPreview);
    setDragIndex(null);
    setKeys(nextKeys);
    setPreviews(nextPreviews);
    persistOrder(nextKeys);
  }

  async function handleRemove(index: number) {
    if (!confirm("این صفحه حذف بشه؟")) return;
    setPending(true);
    const result = await removeChapterPage(chapterId, index);
    if (result.success) {
      setKeys((prev) => prev.filter((_, i) => i !== index));
      setPreviews((prev) => prev.filter((_, i) => i !== index));
    }
    setPending(false);
  }

  if (keys.length === 0) {
    return <p className="text-xs text-text-muted">صفحه‌ای موجود نیست.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
      {previews.map((url, index) => (
        <div
          key={keys[index]}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e: DragEvent) => e.preventDefault()}
          onDrop={() => handleDrop(index)}
          className="group relative aspect-[2/3] cursor-move overflow-hidden rounded-md border border-border bg-background"
        >
          <img src={url} alt="" className="h-full w-full object-cover" />
          <span className="absolute right-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{index + 1}</span>
          <button
            type="button"
            onClick={() => handleRemove(index)}
            disabled={pending}
            className="absolute left-1 top-1 rounded bg-red-500/90 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}