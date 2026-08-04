"use client";

import { useState, type FormEvent } from "react";
import { updatePublisherProfile } from "@/app/publisher/actions/profile";

interface PublisherProfileFormProps {
  initial: {
    bio: string | null;
    avatarUrl: string | null;
    telegramUrl: string | null;
    instagramUrl: string | null;
    websiteUrl: string | null;
    donationCardNumber: string | null;
    donationLink: string | null;
  };
}

export function PublisherProfileForm({ initial }: PublisherProfileFormProps) {
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [telegramUrl, setTelegramUrl] = useState(initial.telegramUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl ?? "");
  const [donationCardNumber, setDonationCardNumber] = useState(initial.donationCardNumber ?? "");
  const [donationLink, setDonationLink] = useState(initial.donationLink ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updatePublisherProfile({ bio, avatarUrl, telegramUrl, instagramUrl, websiteUrl, donationCardNumber, donationLink });

    if (result.success) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(result.error ?? "خطا");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">پروفایل ناشر</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="pub-avatar">لینک آواتار</label>
        <input id="pub-avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="pub-bio">بیوگرافی</label>
        <textarea id="pub-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="pub-telegram">تلگرام</label>
          <input id="pub-telegram" value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="pub-instagram">اینستاگرام</label>
          <input id="pub-instagram" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="pub-website">وب‌سایت</label>
          <input id="pub-website" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="pub-card">شماره کارت دونیت</label>
          <input id="pub-card" value={donationCardNumber} onChange={(e) => setDonationCardNumber(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="pub-donate-link">لینک دونیت خارجی</label>
          <input id="pub-donate-link" value={donationLink} onChange={(e) => setDonationLink(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">پروفایل ذخیره شد.</p>}

      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}