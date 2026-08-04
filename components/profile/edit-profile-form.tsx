"use client";

import { useState, type FormEvent } from "react";
import { updateProfileDetails } from "@/app/actions/profile";

interface EditProfileFormProps {
  initialBio: string | null;
  initialAvatarUrl: string | null;
  initialDonationLink: string | null;
  onSaved?: () => void;
}

export function EditProfileForm({ initialBio, initialAvatarUrl, initialDonationLink, onSaved }: EditProfileFormProps) {
  const [bio, setBio] = useState(initialBio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [donationLink, setDonationLink] = useState(initialDonationLink ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updateProfileDetails({ bio, avatarUrl, donationLink });

    if (result.success) {
      setStatus("done");
      setTimeout(() => onSaved?.(), 800);
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در ذخیره‌سازی");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-4">
      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="profile-avatar">لینک آواتار</label>
        <input
          id="profile-avatar"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="profile-bio">بیوگرافی</label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="profile-donation">لینک دونیت خارجی (اختیاری)</label>
        <input
          id="profile-donation"
          value={donationLink}
          onChange={(e) => setDonationLink(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">پروفایل ذخیره شد.</p>}

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