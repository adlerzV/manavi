"use server";

import { requireComicManageAccessByComicId } from "@/lib/auth";
import { uploadComicBanner } from "@/lib/s3";
import { describeUploadError } from "@/lib/upload-error";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

const MAX_BANNER_SIZE_BYTES = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadComicBannerAsPublisherAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const comicId = formData.get("comicId");
    const file = formData.get("banner") as File | null;

    if (typeof comicId !== "string" || !comicId) {
      return { success: false, error: "comicId الزامی است" };
    }
    if (!file) {
      return { success: false, error: "فایل بنر یافت نشد" };
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return { success: false, error: `فرمت فایل پشتیبانی نمی‌شود: ${file.type}` };
    }
    if (file.size > MAX_BANNER_SIZE_BYTES) {
      return { success: false, error: `حجم فایل نباید بیش از ${MAX_BANNER_SIZE_BYTES / 1024 / 1024} مگابایت باشد` };
    }

    await requireComicManageAccessByComicId(comicId);

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadComicBanner(comicId, buffer, file.type);

    return { success: true, data: { url } };
  } catch (err) {
    return { success: false, error: describeUploadError(err) };
  }
}