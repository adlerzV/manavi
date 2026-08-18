"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadComicBannerAction } from "@/app/admin/actions/comic-banner";

interface BannerUploaderProps {
  comicId: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploadAction?: (formData: FormData) => Promise<{ success: boolean; error?: string; data?: { url: string } }>;
}

export function BannerUploader({ comicId, currentUrl, onUploaded, uploadAction }: BannerUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(file: File) {
    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.set("comicId", comicId);
    formData.set("banner", file);

    const action = uploadAction ?? uploadComicBannerAction;
    const result = await action(formData);

    if (result.success && result.data) {
      onUploaded(result.data.url);
      setStatus("idle");
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در آپلود بنر");
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-background p-3">
      <p className="text-xs text-text-muted">تصویر بنر هیرو (کیفیت بالا، برای نمایش در صفحه اصلی)</p>
      {currentUrl && (
        <div className="relative h-32 w-full overflow-hidden rounded-md bg-surface">
          <Image src={currentUrl} alt="بنر هیرو" fill sizes="600px" className="object-cover" />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelect(file);
          e.target.value = "";
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status === "uploading"}
        className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-text-main disabled:opacity-50"
      >
        {status === "uploading" ? "در حال آپلود…" : "آپلود تصویر بنر"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}