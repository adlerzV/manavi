"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendBroadcast, getBroadcastJobStatusAction, type BroadcastJobMeta } from "@/app/admin/actions/broadcast";

const POLL_INTERVAL_MS = 2500;

export function BroadcastForm() {
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{ sent: number; failed: number } | null>(null);
  const [job, setJob] = useState<BroadcastJobMeta | null>(null);
  const jobIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!jobIdRef.current || job?.status === "DONE") return;

    const timer = setInterval(async () => {
      if (!jobIdRef.current) return;
      const result = await getBroadcastJobStatusAction(jobIdRef.current);
      if (result.success && result.data) {
        setJob(result.data);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [job?.status]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirm("پیام برای همه کاربران فعال ارسال می‌شود. مطمئنید؟")) return;

    setStatus("sending");
    setError(null);
    setSyncResult(null);
    setJob(null);
    jobIdRef.current = null;

    const response = await sendBroadcast({
      message,
      buttonText: buttonText || undefined,
      buttonUrl: buttonUrl || undefined,
    });

    if (response.success && response.data) {
      setStatus("done");
      setMessage("");
      setButtonText("");
      setButtonUrl("");

      if (response.data.mode === "sync") {
        setSyncResult({ sent: response.data.sent ?? 0, failed: response.data.failed ?? 0 });
      } else if (response.data.jobId) {
        jobIdRef.current = response.data.jobId;
        setJob({ total: response.data.total ?? 0, sent: 0, failed: 0, status: "PENDING" });
      }
    } else {
      setStatus("error");
      setError(response.error ?? "خطا در ارسال");
    }
  }

  const jobProgress = job && job.total > 0 ? Math.min(100, ((job.sent + job.failed) / job.total) * 100) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">ارسال پیام همگانی به تلگرام</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="broadcast-message">متن پیام</label>
        <textarea id="broadcast-message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} maxLength={3500} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        <p className="text-left text-xs text-text-muted">{message.length}/3500</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="broadcast-btn-text">متن دکمه (اختیاری)</label>
          <input id="broadcast-btn-text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="broadcast-btn-url">مسیر دکمه در مینی‌اپ</label>
          <input id="broadcast-btn-url" value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="/app/explore" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {syncResult && <p className="text-sm text-primary">ارسال شد: {syncResult.sent} موفق، {syncResult.failed} ناموفق</p>}

      {job && (
        <div className="space-y-2 rounded-md border border-border bg-background p-3">
          <p className="text-sm text-text-main">
            {job.status === "DONE" ? "ارسال کامل شد" : "در حال ارسال در پس‌زمینه — می‌تونی این صفحه رو ببندی، ادامه پیدا می‌کنه"}
          </p>
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full bg-primary transition-all" style={{ width: `${jobProgress}%` }} />
          </div>
          <p className="text-xs text-text-muted">
            {(job.sent + job.failed).toLocaleString("fa-IR")} از {job.total.toLocaleString("fa-IR")} — {job.sent.toLocaleString("fa-IR")} موفق، {job.failed.toLocaleString("fa-IR")} ناموفق
          </p>
        </div>
      )}

      <button type="submit" disabled={status === "sending" || !message.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "sending" ? "در حال ارسال…" : "ارسال پیام"}
      </button>
    </form>
  );
}