"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadComicBannerAction, uploadComicCoverAction } from "@/app/admin/actions/comic-banner";

type UploadFn = (formData: FormData) => Promise<{ success: boolean; error?: string; data?: { url: string } }>;

interface ImageUploaderProps {
  comicId: string | null;
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploadAction: UploadFn;
  fieldName: string;
  label: string;
  aspectClassName?: string;
}

export function ImageUploader({ comicId, currentUrl, onUploaded, uploadAction, fieldName, label, aspectClassName = "h-32" }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(file: File) {
    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    if (comicId) formData.set("comicId", comicId);
    formData.set(fieldName, file);

    const result = await uploadAction(formData);

    if (result.success && result.data) {
      onUploaded(result.data.url);
      setStatus("idle");
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در آپلود تصویر");
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-border bg-background p-3">
      <p className="text-xs text-text-muted">{label}</p>
      {currentUrl && (
        <div className={`relative w-full overflow-hidden rounded-md bg-surface ${aspectClassName}`}>
          <Image src={currentUrl} alt={label} fill sizes="600px" className="object-cover" />
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
        {status === "uploading" ? "در حال آپلود…" : currentUrl ? "تغییر تصویر" : "آپلود تصویر"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function BannerUploader({
  comicId,
  currentUrl,
  onUploaded,
  uploadAction = uploadComicBannerAction,
}: {
  comicId: string | null;
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploadAction?: UploadFn;
}) {
  return (
    <ImageUploader
      comicId={comicId}
      currentUrl={currentUrl}
      onUploaded={onUploaded}
      uploadAction={uploadAction}
      fieldName="banner"
      label="تصویر بنر هیرو (کیفیت بالا، برای نمایش در صفحه اصلی)"
      aspectClassName="h-32"
    />
  );
}

export function CoverUploader({
  comicId,
  currentUrl,
  onUploaded,
  uploadAction = uploadComicCoverAction,
}: {
  comicId: string | null;
  currentUrl: string;
  onUploaded: (url: string) => void;
  uploadAction?: UploadFn;
}) {
  return (
    <ImageUploader
      comicId={comicId}
      currentUrl={currentUrl}
      onUploaded={onUploaded}
      uploadAction={uploadAction}
      fieldName="cover"
      label="تصویر کاور (نسبت ابعاد ۲:۳ پیشنهاد می‌شود)"
      aspectClassName="aspect-[2/3] h-56"
    />
  );
}