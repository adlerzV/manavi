"use client";

import { useState, type FormEvent } from "react";
import { submitCreatorApplication } from "@/app/actions/creator-application";

export function CreatorApplicationForm() {
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); 
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (website) {
      setStatus("done");
      return;
    }

    setStatus("saving");
    setError(null);

    const result = await submitCreatorApplication({
      fullName,
      contact,
      portfolioUrl: portfolioUrl || undefined,
      message,
    });

    if (result.success) {
      setStatus("done");
      setFullName("");
      setContact("");
      setPortfolioUrl("");
      setMessage("");
      setWebsite("");
    } else {
      setStatus("error");
      setError(result.error ?? "خطایی رخ داد");
    }
  }

  if (status === "done") {
    return (
      <p className="rounded-md border border-primary bg-surface p-6 text-center text-sm text-primary">
        درخواست شما ثبت شد. تیم ما به‌زودی از طریق راه ارتباطی که وارد کردید تماس می‌گیرد.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="creator-name">
          نام و نام خانوادگی
        </label>
        <input
          id="creator-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="creator-contact">
          راه ارتباطی (تلگرام / ایمیل)
        </label>
        <input
          id="creator-contact"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="creator-portfolio">
          لینک نمونه‌کار <span className="text-text-muted">(اختیاری)</span>
        </label>
        <input
          id="creator-portfolio"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="creator-message">
          توضیح کوتاه
        </label>
        <textarea
          id="creator-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={status === "saving"}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {status === "saving" ? "در حال ارسال…" : "ارسال درخواست همکاری"}
      </button>
    </form>
  );
}