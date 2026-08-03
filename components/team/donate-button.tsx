// components/team/donate-button.tsx
"use client";

import { useState } from "react";
import { DONATION_PRESETS_TOMAN, MIN_DONATION_TOMAN } from "@/lib/billing";

export function DonateButton({ receiverId, authenticated }: { receiverId: string; authenticated: boolean }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(DONATION_PRESETS_TOMAN[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDonate() {
    if (!authenticated) return;
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!Number.isFinite(finalAmount) || finalAmount < MIN_DONATION_TOMAN) {
      setError(`حداقل مبلغ حمایت ${MIN_DONATION_TOMAN.toLocaleString("fa-IR")} تومان است`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payments/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, amountToman: finalAmount, message: message.trim() || undefined }),
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error ?? "خطا در ایجاد پرداخت");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={!authenticated}
        className="rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent disabled:opacity-50"
      >
        حمایت مالی
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-surface p-4">
      <p className="text-sm text-text-main">مبلغ حمایت (تومان)</p>
      <div className="flex flex-wrap gap-2">
        {DONATION_PRESETS_TOMAN.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setAmount(preset);
              setCustomAmount("");
            }}
            className={`rounded-md px-3 py-1.5 text-xs ${
              !customAmount && amount === preset
                ? "bg-accent text-accent-foreground"
                : "border border-border text-text-muted"
            }`}
          >
            {preset.toLocaleString("fa-IR")}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={customAmount}
        onChange={(e) => setCustomAmount(e.target.value)}
        placeholder="مبلغ دلخواه"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="پیام (اختیاری)"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-accent"
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleDonate}
          disabled={loading}
          className="flex-1 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
        >
          {loading ? "در حال انتقال…" : "پرداخت"}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm text-text-muted">
          انصراف
        </button>
      </div>
    </div>
  );
}