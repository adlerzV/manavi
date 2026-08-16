"use client";

import { useState, type FormEvent } from "react";
import { sendBroadcast } from "@/app/admin/actions/broadcast";

export function BroadcastForm() {
  const [message, setMessage] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!confirm("پیام برای همه کاربران فعال ارسال می‌شود. مطمئنید؟")) return;

    setStatus("sending");
    setError(null);
    setResult(null);

    const response = await sendBroadcast({
      message,
      buttonText: buttonText || undefined,
      buttonUrl: buttonUrl || undefined,
    });

    if (response.success && response.data) {
      setStatus("done");
      setResult(response.data);
      setMessage("");
      setButtonText("");
      setButtonUrl("");
    } else {
      setStatus("error");
      setError(response.error ?? "خطا در ارسال");
    }
  }

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
      {status === "done" && result && <p className="text-sm text-primary">ارسال شد: {result.sent} موفق، {result.failed} ناموفق</p>}

      <button type="submit" disabled={status === "sending" || !message.trim()} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "sending" ? "در حال ارسال…" : "ارسال پیام"}
      </button>
    </form>
  );
}