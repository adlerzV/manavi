"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadPublisherAvatar } from "@/lib/s3";
import { describeUploadError } from "@/lib/upload-error";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadPublisherAvatarAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const user = await getSessionUser();
    if (!user) return { success: false, error: "برای این عملیات باید وارد شوید" };

    const context = await getPublisherContext(user);
    if (!context?.publisherId) {
      return { success: false, error: "دسترسی ناشر یافت نشد یا غیرفعال است" };
    }

    const file = formData.get("avatar") as File | null;
    if (!file) return { success: false, error: "فایل تصویر یافت نشد" };
    if (!ALLOWED_TYPES.has(file.type)) {
      return { success: false, error: `فرمت فایل پشتیبانی نمی‌شود: ${file.type}` };
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      return {
        success: false,
        error: `حجم فایل نباید بیش از ${MAX_AVATAR_SIZE_BYTES / 1024 / 1024} مگابایت باشد`,
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadPublisherAvatar(context.publisherId, buffer, file.type);

    await prisma.publisher.update({
      where: { id: context.publisherId },
      data: { logoUrl: url },
    });

    revalidatePath("/publisher/settings");

    return { success: true, data: { url } };
  } catch (err) {
    return { success: false, error: describeUploadError(err) };
  }
}