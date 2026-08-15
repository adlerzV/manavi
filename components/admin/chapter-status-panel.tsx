"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { publishChapter } from "@/app/admin/actions/publish-chapter";
import { scheduleChapter, cancelSchedule, deleteChapter } from "@/app/admin/actions/chapter-lifecycle";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import type { ChapterStatus } from "@prisma/client";

interface ChapterStatusPanelProps {
  chapterId: string;
  status: ChapterStatus;
  scheduledAt: string | null;
  chapterLabel: string;
}

export function ChapterStatusPanel({ chapterId, status: initialStatus, scheduledAt, chapterLabel }: ChapterStatusPanelProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ChapterStatus>(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [scheduleValue, setScheduleValue] = useState(scheduledAt ? scheduledAt.slice(0, 16) : "");
  const [showSchedule, setShowSchedule] = useState(false);

  function handlePublishNow() {
    setError(null);
    startTransition(async () => {
      const result = await publishChapter(chapterId);
      if (!result.success) {
        setError(result.error ?? "خطا در انتشار");
      } else if (result.data) {
        setStatus(result.data.status);
      }
    });
  }

  function handleSchedule() {
    setError(null);
    if (!scheduleValue) {
      setError("زمان انتشار را انتخاب کنید");
      return;
    }
    startTransition(async () => {
      const result = await scheduleChapter(chapterId, new Date(scheduleValue).toISOString());
      if (!result.success) {
        setError(result.error ?? "خطا در زمان‌بندی");
      } else {
        setStatus("SCHEDULED");
        setShowSchedule(false);
      }
    });
  }

  function handleCancelSchedule() {
    setError(null);
    startTransition(async () => {
      const result = await cancelSchedule(chapterId);
      if (!result.success) {
        setError(result.error ?? "خطا");
      } else {
        setStatus("DRAFT");
      }
    });
  }

  const deleteButton = (
    <DeleteConfirmDialog
      triggerLabel="حذف چپتر"
      confirmTitle={`حذف ${chapterLabel}`}
      confirmDescription="این عمل غیرقابل بازگشت است و تمام صفحات، نظرات و دسترسی‌های خریداری‌شده این چپتر حذف می‌شوند."
      confirmValue={chapterLabel}
      onConfirm={() => deleteChapter(chapterId)}
      onDeleted={() => router.refresh()}
    />
  );

  if (status === "PUBLISHED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-primary">منتشرشده</span>
        {deleteButton}
      </div>
    );
  }

  if (status === "PENDING_APPROVAL") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-accent">در انتظار تایید ادمین</span>
        {deleteButton}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  if (status === "SCHEDULED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-accent">
          زمان‌بندی‌شده — {scheduledAt ? new Date(scheduledAt).toLocaleString("fa-IR") : ""}
        </span>
        <button onClick={handleCancelSchedule} disabled={isPending} className="rounded-md border border-border px-2 py-1 text-xs text-text-muted disabled:opacity-50">
          لغو
        </button>
        {deleteButton}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={handlePublishNow} disabled={isPending} className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50">
        {isPending ? "در حال انتشار…" : "انتشار فوری"}
      </button>
      <button onClick={() => setShowSchedule((prev) => !prev)} disabled={isPending} className="rounded-md border border-border px-3 py-1 text-xs text-text-main disabled:opacity-50">
        زمان‌بندی
      </button>
      {showSchedule && (
        <div className="flex items-center gap-2">
          <input
            type="datetime-local"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1 text-xs text-text-main"
          />
          <button onClick={handleSchedule} disabled={isPending} className="rounded-md bg-accent px-2 py-1 text-xs text-accent-foreground disabled:opacity-50">
            تایید
          </button>
        </div>
      )}
      {deleteButton}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}