"use client";

import { useState, type FormEvent } from "react";
import { createNotice, deleteNotice, type NoticeRow } from "@/app/admin/actions/notices";

const DURATION_OPTIONS = [
  { label: "۱ روز", hours: 24 },
  { label: "۳ روز", hours: 72 },
  { label: "۱ هفته", hours: 24 * 7 },
  { label: "۲ هفته", hours: 24 * 14 },
];

export function NoticeManager({ initialNotices }: { initialNotices: NoticeRow[] }) {
  const [notices, setNotices] = useState(initialNotices);
  const [message, setMessage] = useState("");
  const [durationHours, setDurationHours] = useState(DURATION_OPTIONS[2].hours);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await createNotice({ message, durationHours });
    if (result.success) {
      setMessage("");
      setStatus("idle");
      window.location.reload();
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در ثبت اعلان");
    }
  }

  async function handleDelete(noticeId: string) {
    if (!confirm("این اعلان حذف بشه؟")) return;
    setPendingId(noticeId);
    const result = await deleteNotice(noticeId);
    if (result.success) {
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    }
    setPendingId(null);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
        <h2 className="text-lg font-medium text-text-main">اعلان تازه</h2>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="notice-message">متن اعلان</label>
          <textarea
            id="notice-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
        </div>
        <div className="space-y-1">
          <span className="text-sm text-text-muted">مدت نمایش</span>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.hours}
                onClick={() => setDurationHours(opt.hours)}
                className={`rounded-full border px-3 py-1.5 text-xs ${
                  durationHours === opt.hours ? "border-primary bg-primary/10 text-primary" : "border-border text-text-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        {status === "error" && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {status === "saving" ? "در حال ثبت…" : "انتشار اعلان"}
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">اعلان‌های اخیر</h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {notices.map((n) => (
            <div key={n.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-text-main">{n.message}</p>
                <p className="text-xs text-text-muted">
                  {n.isActive ? (
                    <span className="text-primary">فعال تا {new Date(n.expiresAt).toLocaleString("fa-IR")}</span>
                  ) : (
                    <span>منقضی‌شده — {new Date(n.expiresAt).toLocaleString("fa-IR")}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                disabled={pendingId === n.id}
                className="flex-shrink-0 rounded-md border border-red-400 px-2 py-1 text-xs text-red-400 disabled:opacity-50"
              >
                حذف
              </button>
            </div>
          ))}
          {notices.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">اعلانی ثبت نشده.</p>}
        </div>
      </div>
    </div>
  );
}