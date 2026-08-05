"use client";

import { useRouter } from "next/navigation";
import { deleteComic } from "@/app/admin/actions/catalog-actions";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export function ComicDeleteButton({ comicId, comicTitle }: { comicId: string; comicTitle: string }) {
  const router = useRouter();

  return (
    <DeleteConfirmDialog
      triggerLabel="حذف عنوان"
      confirmTitle={`حذف «${comicTitle}»`}
      confirmDescription="این عمل غیرقابل بازگشت است و تمام چپترها، نظرات، بوکمارک‌ها و فایل‌های مرتبط با این عنوان حذف می‌شوند."
      confirmValue={comicTitle}
      onConfirm={() => deleteComic(comicId)}
      onDeleted={() => router.push("/admin/comics")}
    />
  );
}