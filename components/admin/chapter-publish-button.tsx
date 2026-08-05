"use client";

import { useState, useTransition } from "react";
import { publishChapter } from "@/app/admin/actions/publish-chapter";

export function ChapterPublishButton({ chapterId }: { chapterId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePublish() {
    setError(null);
    startTransition(async () => {
      const result = await publishChapter(chapterId);
      if (!result.success) setError(result.error ?? "خطا در انتشار");
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePublish}
        disabled={isPending}
        className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
      >
        {isPending ? "در حال انتشار…" : "انتشار"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}