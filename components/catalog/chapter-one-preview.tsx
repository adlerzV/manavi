import { PreviewImage } from "./preview-image";

interface ChapterOnePreviewProps {
  chapterId: string;
  chapterNumber: number;
  previewImages: string[];
}

export function ChapterOnePreview({ previewImages }: ChapterOnePreviewProps) {
  if (previewImages.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-md border border-border bg-surface text-xs text-text-muted">
        پیش‌نمایشی موجود نیست
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="relative max-h-[420px] overflow-hidden">
        <div className="flex flex-col">
          {previewImages.map((src, index) => (
            <PreviewImage key={index} src={src} alt={`پیش‌نمایش صفحه ${index + 1}`} />
          ))}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
          style={{ backgroundImage: "linear-gradient(to top, #000000cc, transparent)" }}
        />
      </div>
    </div>
  );
}