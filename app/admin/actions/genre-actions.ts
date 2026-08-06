"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { GENRE_IMAGE_OPTIONS } from "@/lib/genre-images";

interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function createGenre(input: { name: string; imageUrl?: string }): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin();

    const name = input.name.trim();
    if (!name) {
      return { success: false, error: "نام دسته‌بندی الزامی است" };
    }
    if (input.imageUrl && !GENRE_IMAGE_OPTIONS.some((option) => option.value === input.imageUrl)) {
      return { success: false, error: "تصویر انتخاب‌شده معتبر نیست" };
    }

    const genre = await prisma.genre.create({
      data: { name, slug: slugify(name), imageUrl: input.imageUrl || null },
    });

    revalidateTag("genres");
    revalidatePath("/admin/genres");
    revalidatePath("/admin/comics");
    revalidatePath("/app/explore");
    return { success: true, data: { id: genre.id } };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateGenreImage(genreId: string, imageUrl: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!GENRE_IMAGE_OPTIONS.some((option) => option.value === imageUrl)) {
      return { success: false, error: "تصویر انتخاب‌شده معتبر نیست" };
    }

    await prisma.genre.update({ where: { id: genreId }, data: { imageUrl } });

    revalidateTag("genres");
    revalidatePath("/admin/genres");
    revalidatePath("/app/explore");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteGenre(genreId: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const inUse = await prisma.comicGenre.count({ where: { genreId } });
    if (inUse > 0) {
      return { success: false, error: "این دسته‌بندی به عناوینی متصل است و قابل حذف نیست" };
    }

    await prisma.genre.delete({ where: { id: genreId } });

    revalidateTag("genres");
    revalidatePath("/admin/genres");
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}