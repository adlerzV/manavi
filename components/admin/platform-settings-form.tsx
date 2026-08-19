"use client";

import { useState, type FormEvent } from "react";
import { updatePlatformSettings } from "@/app/admin/actions/platform-settings";

interface PlatformSettingsFormProps {
  initialCoinCost: number;
  initialThresholdHours: number;
  initialCoinPriceUsdt: number;
  initialTomanPerUsdt: number;
}

export function PlatformSettingsForm({
  initialCoinCost,
  initialThresholdHours,
  initialCoinPriceUsdt,
  initialTomanPerUsdt,
}: PlatformSettingsFormProps) {
  const [coinCost, setCoinCost] = useState(initialCoinCost);
  const [thresholdHours, setThresholdHours] = useState(initialThresholdHours);
  const [coinPriceUsdt, setCoinPriceUsdt] = useState(initialCoinPriceUsdt);
  const [tomanPerUsdt, setTomanPerUsdt] = useState(initialTomanPerUsdt);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updatePlatformSettings({
      chapterUnlockCoinCost: Number(coinCost),
      newReleaseThresholdHours: Number(thresholdHours),
      coinPriceUsdt: Number(coinPriceUsdt),
      tomanPerUsdt: Number(tomanPerUsdt),
    });

    if (result.success) {
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
      setError(result.error ?? "مشکلی در ثبت تنظیمات پیش آمد");
    }
  }

  const chapterPriceToman = tomanPerUsdt > 0 ? Math.round(coinCost * coinPriceUsdt * tomanPerUsdt) : null;

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
            پیش‌نمایش: آنلاک هر چپتر سکه‌ای با پرداخت <span className="font-semibold text-accent">{coinCost.toLocaleString("fa-IR")} سکه</span> انجام خواهد شد. این قیمت روی همه‌ی چپترهای سکه‌ای پلتفرم یکسانه.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-main" htmlFor="coin-price-usdt">
            ارزش هر سکه به تتر (USDT)
          </label>
          <input
            id="coin-price-usdt"
            type="number"
            min="0"
            step="any"
            value={coinPriceUsdt}
            onChange={(e) => setCoinPriceUsdt(Number(e.target.value))}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
          <p className="text-xs text-text-muted">
            این نرخ برای «خرید سکه به مقدار دلخواه» در فروشگاه و همچنین تبدیل سهم ناشرها از سکه به USDT در لاگ تسویه‌حساب استفاده می‌شه. قیمت پکیج‌های سکه مستقل از این نرخ و دستی تنظیم می‌شه.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-text-main" htmlFor="toman-per-usdt">
            نرخ نمایشی: هر ۱ تتر چند تومان
          </label>
          <input
            id="toman-per-usdt"
            type="number"
            min="0"
            step="1"
            value={tomanPerUsdt}
            onChange={(e) => setTomanPerUsdt(Number(e.target.value))}
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
          <p className="text-xs text-text-muted">
            فقط برای نمایش معادل تومانی قیمت‌ها به کاربر استفاده می‌شه — پرداخت واقعی همیشه با USDT انجام می‌شه.
            {chapterPriceToman !== null && (
              <> معادل فعلی هر چپتر سکه‌ای: <span className="text-text-main">≈ {chapterPriceToman.toLocaleString("fa-IR")} تومان</span>.</>
            )}
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