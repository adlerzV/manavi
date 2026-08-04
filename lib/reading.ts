import type { ContentType, ReadingMode } from "@prisma/client";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  MANHWA: "مانهوا",
  MANGA: "مانگا",
  COMIC: "کامیک",
  WEBTOON: "وبتون",
};

export const READING_MODE_LABELS: Record<ReadingMode, string> = {
  VERTICAL: "اسکرول عمودی",
  HORIZONTAL: "صفحه‌بندی افقی",
};

export function suggestReadingMode(contentType: ContentType): ReadingMode {
  return contentType === "MANGA" || contentType === "COMIC" ? "HORIZONTAL" : "VERTICAL";
}

const READING_MODE_STORAGE_PREFIX = "manavi-reading-mode";

export function getStoredReadingModeOverride(comicId: string): ReadingMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${READING_MODE_STORAGE_PREFIX}:${comicId}`);
    return raw === "VERTICAL" || raw === "HORIZONTAL" ? raw : null;
  } catch {
    return null;
  }
}

export function setStoredReadingModeOverride(comicId: string, mode: ReadingMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${READING_MODE_STORAGE_PREFIX}:${comicId}`, mode);
  } catch {}
}