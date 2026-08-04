"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { updateGenreImage, deleteGenre } from "@/app/admin/actions/genre-actions";
import { GENRE_IMAGE_OPTIONS } from "@/lib/genre-images";

interface GenreRow {
  id: string;
  name: string;
  imageUrl: string | null;
  comicCount: number;
}

export function GenreManager({ genres }: { genres: GenreRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleImageSelect(genreId: string, value: string) {
    startTransition(async () => {
      const result = await updateGenreImage(genreId, value);
      if (result.success) {
        setEditingId(null);
      } else {
        setError(result.error ?? "خطا");
      }
    });
  }

  function handleDelete(genreId: string) {
    if (!confirm("این دسته‌بندی حذف بشه؟")) return;
    startTransition(async () => {
      const result = await deleteGenre(genreId);
      if (!result.success) setError(result.error ?? "خطا");
    });
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-text-main">لیست دسته‌بندی‌ها</h2>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {genres.map((genre) => (
          <div key={genre.id} className="space-y-2 rounded-md border border-border bg-surface p-3">
            <div className="relative aspect-square w-full overflow-hidden rounded-md bg-background">
              {genre.imageUrl ? (
                <Image src={genre.imageUrl} alt={genre.name} fill sizes="150px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-text-muted">بدون تصویر</div>
              )}
            </div>
            <p className="text-sm text-text-main">{genre.name}</p>
            <p className="text-xs text-text-muted">{genre.comicCount.toLocaleString("fa-IR")} عنوان</p>

            {editingId === genre.id ? (
              <div className="grid grid-cols-4 gap-1">
                {GENRE_IMAGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    disabled={isPending}
                    onClick={() => handleImageSelect(genre.id, option.value)}
                    className="relative aspect-square overflow-hidden rounded border border-border"
                  >
                    <Image src={option.value} alt={option.label} fill sizes="40px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingId(genre.id)} className="text-xs text-primary">تغییر تصویر</button>
                <button onClick={() => handleDelete(genre.id)} disabled={isPending} className="text-xs text-red-400 disabled:opacity-50">حذف</button>
              </div>
            )}
          </div>
        ))}
        {genres.length === 0 && <p className="col-span-full text-sm text-text-muted">هنوز دسته‌بندی‌ای ثبت نشده.</p>}
      </div>
    </div>
  );
}