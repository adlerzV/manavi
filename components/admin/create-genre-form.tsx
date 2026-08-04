"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { createGenre } from "@/app/admin/actions/genre-actions";
import { GENRE_IMAGE_OPTIONS } from "@/lib/genre-images";

export function CreateGenreForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState(GENRE_IMAGE_OPTIONS[0]?.value ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await createGenre({ name, imageUrl });

    if (result.success) {
      setStatus("done");
      setName("");
      setTimeout(() => onCreated?.(), 1000);
    } else {
      setStatus("error");
      setError(result.error ?? "خطا");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">افزودن دسته‌بندی</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="genre-name">نام دسته‌بندی</label>
        <input
          id="genre-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <span className="text-sm text-text-muted">تصویر (از پوشه public/genres)</span>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {GENRE_IMAGE_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => setImageUrl(option.value)}
              className={`flex flex-col items-center gap-1 rounded-md border p-2 text-center ${
                imageUrl === option.value ? "border-primary bg-primary/10" : "border-border bg-background"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded bg-surface">
                <Image src={option.value} alt={option.label} fill sizes="80px" className="object-cover" />
              </div>
              <span className="text-[10px] text-text-muted">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">دسته‌بندی اضافه شد.</p>}

      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "در حال ذخیره…" : "افزودن دسته‌بندی"}
      </button>
    </form>
  );
}