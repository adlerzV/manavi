"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ChapterAccessType } from "@prisma/client";
import { uploadChapter } from "@/app/admin/actions/upload-chapter";
import { BatchPageUploader } from "./batch-page-uploader";
import { useCollapsibleClose } from "@/components/ui/collapsible-section";
import { CHAPTER_ACCESS_TYPE_OPTIONS } from "@/lib/chapter-access";
interface ComicOption {
  id: string;
  title: string;
}

export function UploadChapterForm({ comics }: { comics: ComicOption[] }) {
  const router = useRouter();
  const close = useCollapsibleClose();
  const [comicId, setComicId] = useState(comics[0]?.id ?? "");
  const [chapterNumber, setChapterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [accessType, setAccessType] = useState<ChapterAccessType>("FREE");
  const [coinCost, setCoinCost] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const needsCoinCost = accessType === "COIN" || accessType === "COIN_OR_SUBSCRIPTION";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setStatus("error");
      setError("حداقل یک تصویر صفحه انتخاب کنید");
      return;
    }

    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.set("comicId", comicId);
    formData.set("chapterNumber", chapterNumber);
    formData.set("title", title);
    formData.set("accessType", accessType);
    if (needsCoinCost && coinCost) formData.set("coinCost", coinCost);
    files.forEach((file) => formData.append("pages", file));

    const result = await uploadChapter(formData);

    if (result.success) {
      setStatus("done");
      setChapterNumber("");
      setTitle("");
      setAccessType("FREE");
      setCoinCost("");
      setFiles([]);
      router.refresh();
      setTimeout(() => close?.(), 1000);
    } else {
      setStatus("error");
      setError(result.error ?? "خطایی رخ داد");
    }
  }

  if (comics.length === 0) {
    return <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">عنوانی موجود نیست — ابتدا یک عنوان بسازید.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">آپلود چپتر</h2>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="chapter-comic">عنوان</label>
        <select id="chapter-comic" value={comicId} onChange={(e) => setComicId(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary">
          {comics.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="chapter-number">شماره چپتر</label>
          <input id="chapter-number" type="number" step="0.1" value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="chapter-title">عنوان چپتر <span className="text-text-muted">(اختیاری)</span></label>
          <input id="chapter-title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="chapter-access">نوع دسترسی</label>
          <select
            id="chapter-access"
            value={accessType}
            onChange={(e) => setAccessType(e.target.value as ChapterAccessType)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary"
          >
            {CHAPTER_ACCESS_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {needsCoinCost && (
          <div className="space-y-1">
            <label className="text-sm text-text-muted" htmlFor="chapter-coin-cost">قیمت (سکه) <span className="text-text-muted">(اختیاری، پیش‌فرض سایت)</span></label>
            <input id="chapter-coin-cost" type="number" min={0} value={coinCost} onChange={(e) => setCoinCost(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
          </div>
        )}
      </div>

      <BatchPageUploader onFilesChange={setFiles} />

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">چپتر به‌صورت پیش‌نویس آپلود شد.</p>}

      <button type="submit" disabled={status === "uploading"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "uploading" ? "در حال آپلود…" : "آپلود چپتر"}
      </button>
    </form>
  );
}