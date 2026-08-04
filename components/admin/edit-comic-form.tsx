"use client";

import { useState, type FormEvent } from "react";
import type { ContentType, ReadingMode } from "@prisma/client";
import { updateComic } from "@/app/admin/actions/catalog-actions";
import { CONTENT_TYPE_LABELS, READING_MODE_LABELS } from "@/lib/reading";

interface LicenseOption {
  id: string;
  publisherName: string;
  territory: string[];
  status: string;
}

interface EditComicFormProps {
  comic: {
    id: string;
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    bannerImage: string | null;
    licenseId: string;
    ageRating: "NORMAL" | "EIGHTEEN_PLUS" | "NSFW";
    contentType: ContentType;
    readingMode: ReadingMode;
    isFeaturedOnHome: boolean;
    featuredBadge: string | null;
  };
  licenses: LicenseOption[];
}

const CONTENT_TYPES: ContentType[] = ["MANHWA", "MANGA", "COMIC", "WEBTOON"];
const READING_MODES: ReadingMode[] = ["VERTICAL", "HORIZONTAL", "DOUBLE_PAGE"];

export function EditComicForm({ comic, licenses }: EditComicFormProps) {
  const [title, setTitle] = useState(comic.title);
  const [slug, setSlug] = useState(comic.slug);
  const [description, setDescription] = useState(comic.description);
  const [coverImage, setCoverImage] = useState(comic.coverImage);
  const [bannerImage, setBannerImage] = useState(comic.bannerImage ?? "");
  const [licenseId, setLicenseId] = useState(comic.licenseId);
  const [ageRating, setAgeRating] = useState(comic.ageRating);
  const [contentType, setContentType] = useState<ContentType>(comic.contentType);
  const [readingMode, setReadingMode] = useState<ReadingMode>(comic.readingMode);
  const [isFeaturedOnHome, setIsFeaturedOnHome] = useState(comic.isFeaturedOnHome);
  const [featuredBadge, setFeaturedBadge] = useState(comic.featuredBadge ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "error" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const licenseOptions = licenses.some((l) => l.id === comic.licenseId)
    ? licenses
    : [{ id: comic.licenseId, publisherName: "(لایسنس فعلی)", territory: [], status: "" }, ...licenses];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const result = await updateComic(comic.id, {
      title,
      slug,
      description,
      coverImage,
      bannerImage: bannerImage || undefined,
      licenseId,
      ageRating,
      contentType,
      readingMode,
      isFeaturedOnHome,
      featuredBadge: featuredBadge || undefined,
    });

    if (result.success) {
      setStatus("done");
    } else {
      setStatus("error");
      setError(result.error ?? "خطا در ذخیره‌سازی");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-medium text-text-main">ویرایش عنوان</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-title">عنوان</label>
          <input id="edit-comic-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-slug">اسلاگ</label>
          <input id="edit-comic-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="[a-z0-9-]+" className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="edit-comic-description">توضیحات</label>
        <textarea id="edit-comic-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-cover">آدرس تصویر کاور</label>
          <input id="edit-comic-cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} required className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-banner">آدرس تصویر بنر (اختیاری)</label>
          <input id="edit-comic-banner" value={bannerImage} onChange={(e) => setBannerImage(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted" htmlFor="edit-comic-license">لایسنس</label>
        <select id="edit-comic-license" value={licenseId} onChange={(e) => setLicenseId(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary">
          {licenseOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.publisherName} {l.territory.length ? `— ${l.territory.join("/")}` : ""} {l.status ? `(${l.status})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-age">رده سنی</label>
          <select id="edit-comic-age" value={ageRating} onChange={(e) => setAgeRating(e.target.value as typeof ageRating)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary">
            <option value="NORMAL">عادی</option>
            <option value="EIGHTEEN_PLUS">۱۸+</option>
            <option value="NSFW">بدون محدودیت</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-content-type">نوع محتوا</label>
          <select id="edit-comic-content-type" value={contentType} onChange={(e) => setContentType(e.target.value as ContentType)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary">
            {CONTENT_TYPES.map((type) => (
              <option key={type} value={type}>{CONTENT_TYPE_LABELS[type]}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted" htmlFor="edit-comic-reading-mode">حالت خوانش</label>
          <select id="edit-comic-reading-mode" value={readingMode} onChange={(e) => setReadingMode(e.target.value as ReadingMode)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-text-main outline-none focus:border-primary">
            {READING_MODES.map((mode) => (
              <option key={mode} value={mode}>{READING_MODE_LABELS[mode]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-end gap-4 rounded-md border border-border bg-background p-3">
        <label className="flex items-center gap-2 text-sm text-text-main">
          <input type="checkbox" checked={isFeaturedOnHome} onChange={(e) => setIsFeaturedOnHome(e.target.checked)} />
          نمایش به‌عنوان بنر ویژه در صفحه اصلی
        </label>
        <div className="flex-1 space-y-1">
          <label className="text-xs text-text-muted" htmlFor="edit-comic-badge">متن بج (مثلاً «چپتر جدید»)</label>
          <input id="edit-comic-badge" value={featuredBadge} onChange={(e) => setFeaturedBadge(e.target.value)} disabled={!isFeaturedOnHome} className="w-full rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text-main outline-none focus:border-primary disabled:opacity-50" />
        </div>
      </div>

      {status === "error" && <p className="text-sm text-red-400">{error}</p>}
      {status === "done" && <p className="text-sm text-primary">تغییرات ذخیره شد.</p>}

      <button type="submit" disabled={status === "saving"} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {status === "saving" ? "در حال ذخیره…" : "ذخیره تغییرات"}
      </button>
    </form>
  );
}