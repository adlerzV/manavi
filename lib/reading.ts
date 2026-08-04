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
  DOUBLE_PAGE: "دو صفحه‌ای (دسکتاپ)",
};

export type ReadingDirection = "rtl" | "ltr";


export function getReadingDirection(contentType: ContentType): ReadingDirection {
  return contentType === "MANGA" || contentType === "COMIC" ? "rtl" : "ltr";
}

export function suggestReadingMode(contentType: ContentType): ReadingMode {
  return contentType === "MANGA" || contentType === "COMIC" ? "HORIZONTAL" : "VERTICAL";
}

const READING_MODE_STORAGE_PREFIX = "manavi-reading-mode";
const VALID_MODES: ReadingMode[] = ["VERTICAL", "HORIZONTAL", "DOUBLE_PAGE"];

export function getStoredReadingModeOverride(comicId: string): ReadingMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${READING_MODE_STORAGE_PREFIX}:${comicId}`);
    return raw && (VALID_MODES as string[]).includes(raw) ? (raw as ReadingMode) : null;
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