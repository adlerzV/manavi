import Link from "next/link";
import Image from "next/image";

interface ChapterOnePreviewProps {
  chapterId: string;
  chapterNumber: number;
  previewImages: string[];
}

export function ChapterOnePreview({ chapterId, chapterNumber, previewImages }: ChapterOnePreviewProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-black">
      <div className="relative h-[420px] w-full overflow-hidden">
        <div className="flex flex-col">
          {previewImages.map((src, index) => (
            <div key={index} className="relative w-full" style={{ aspectRatio: "2 / 3" }}>
              <Image src={src} alt="" fill sizes="600px" className="object-cover" />
            </div>
          ))}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{ backgroundImage: "linear-gradient(to top, #000000, transparent)" }}
        />
      </div>
      <div className="p-4">
        <Link
          href={`/app/read/${chapterId}`}
          className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
        >
          شروع خواندن چپتر {chapterNumber.toLocaleString("fa-IR")}
        </Link>
      </div>
    </div>
  );
}