"use client";

import { useState, type FormEvent } from "react";
import { updatePublisherProfile } from "@/app/publisher/actions/profile";
import { uploadPublisherAvatarAction } from "@/app/publisher/actions/avatar";
import { AvatarUploadCropper } from "@/components/profile/avatar-upload-cropper";
import type { ProfileLink } from "@/lib/profile-links";

interface PublisherProfileFormProps {
  initial: {
    bio: string | null;
    avatarUrl: string | null;
    telegramUrl: string | null;
    instagramUrl: string | null;
    websiteUrl: string | null;
    donationLink: string | null;
    cryptoWalletLabel: string | null;
    cryptoWalletAddress: string | null;
    customLinks: ProfileLink[];
  };
}

export function PublisherProfileForm({ initial }: PublisherProfileFormProps) {
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [telegramUrl, setTelegramUrl] = useState(initial.telegramUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial.instagramUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial.websiteUrl ?? "");
  const [donationLink, setDonationLink] = useState(initial.donationLink ?? "");
  const [cryptoWalletLabel, setCryptoWalletLabel] = useState(initial.cryptoWalletLabel ?? "");
  const [cryptoWalletAddress, setCryptoWalletAddress] = useState(initial.cryptoWalletAddress ?? "");
  const [customLinks, setCustomLinks] = useState<ProfileLink[]>(initial.customLinks);
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateLink(index: number, field: keyof ProfileLink, value: string) {
    setCustomLinks((prev) => prev.map((link, i) => (i === index ? { ...link, [field]: value } : link)));
  }
  function addLink() {
    if (customLinks.length >= 5) return;
    setCustomLinks((prev) => [...prev, { label: "", url: "" }]);
  }
  function removeLink(index: number) {
    setCustomLinks((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updatePublisherProfile({
      bio, avatarUrl, telegramUrl, instagramUrl, websiteUrl, donationLink,
      cryptoWalletLabel, cryptoWalletAddress,
      customLinks: customLinks.filter((l) => l.label.trim() && l.url.trim()),
    });

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
        <span className="text-sm text-text-muted">آپلود تصویر پروفایل</span>
        <AvatarUploadCropper uploadAction={uploadPublisherAvatarAction} onUploaded={setAvatarUrl} />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="pub-avatar">یا لینک آواتار</label>
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

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="pub-donate-link">لینک دونیت خارجی</label>
        <input id="pub-donate-link" value={donationLink} onChange={(e) => setDonationLink(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
      </div>

      <div className="space-y-2 rounded-md border border-border bg-background p-3">
        <p className="text-sm text-text-muted">کیف پول ارزی (برای دونیت شفاف — اختیاری)</p>
        <div className="grid grid-cols-2 gap-2">
          <input value={cryptoWalletLabel} onChange={(e) => setCryptoWalletLabel(e.target.value)} placeholder="عنوان (مثلاً USDT - TRC20)" className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
          <input value={cryptoWalletAddress} onChange={(e) => setCryptoWalletAddress(e.target.value)} placeholder="آدرس کیف پول" className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-text-muted">لینک‌های دلخواه (تا ۵ مورد)</p>
          {customLinks.length < 5 && (
            <button type="button" onClick={addLink} className="text-xs text-primary">+ افزودن لینک</button>
          )}
        </div>
        {customLinks.map((link, index) => (
          <div key={index} className="flex gap-2">
            <input value={link.label} onChange={(e) => updateLink(index, "label", e.target.value)} placeholder="عنوان" className="w-1/3 rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
            <input value={link.url} onChange={(e) => updateLink(index, "url", e.target.value)} placeholder="https://..." className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary" />
            <button type="button" onClick={() => removeLink(index)} className="rounded-md border border-red-400 px-2 text-xs text-red-400">حذف</button>
          </div>
        ))}
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">پروفایل ذخیره شد.</p>}

      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}