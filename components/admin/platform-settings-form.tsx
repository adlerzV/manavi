"use client";

import { useState, type FormEvent } from "react";
import { updatePlatformSettings } from "@/app/admin/actions/platform-settings";

interface PlatformSettingsFormProps {
  initialCoinCost: number;
  initialThresholdHours: number;
}

export function PlatformSettingsForm({
  initialCoinCost,
  initialThresholdHours,
}: PlatformSettingsFormProps) {
  const [coinCost, setCoinCost] = useState(initialCoinCost);
  const [thresholdHours, setThresholdHours] = useState(initialThresholdHours);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updatePlatformSettings({
      chapterUnlockCoinCost: Number(coinCost),
      newReleaseThresholdHours: Number(thresholdHours),
    });

    if (result.success) {
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setError(result.error ?? "مشکلی در ثبت تنظیمات پیش آمد");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-md border border-border bg-surface p-6">
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-main" htmlFor="coin-cost">
            قیمت سکه‌ای هر چپتر (سراسر سایت)
          </label>
          <input
            id="coin-cost"
            type="number"
            min="1"
            value={coinCost}
            onChange={(e) => setCoinCost(Number(e.target.value))}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
          <p className="text-xs text-text-muted">
            پیش‌نمایش: آنلاک هر چپتر با پرداخت <span className="font-semibold text-accent">{coinCost.toLocaleString("fa-IR")} سکه</span> انجام خواهد شد.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-main" htmlFor="threshold-hours">
            بازه زمانی نشان «جدید» (ساعت)
          </label>
          <input
            id="threshold-hours"
            type="number"
            min="1"
            value={thresholdHours}
            onChange={(e) => setThresholdHours(Number(e.target.value))}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
          <p className="text-xs text-text-muted">
            عناوینی که چپتر جدید آن‌ها در <span className="font-semibold text-text-main">{thresholdHours.toLocaleString("fa-IR")} ساعت</span> اخیر منتشر شده باشد، بج «جدید» می‌گیرند.
          </p>
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">تنظیمات با موفقیت به‌روزرسانی شد.</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {status === "saving" ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}