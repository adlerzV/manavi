import Link from "next/link";
import Image from "next/image";
import type { CompletedSeriesComic } from "@/lib/home-feed";

export function CompletedSeriesSection({ comics }: { comics: CompletedSeriesComic[] }) {
  if (comics.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="mb-3 text-base font-medium text-text-main">مجموعه‌های کامل‌شده</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {comics.map((comic) => (
          <Link key={comic.id} href={`/app/comic/${comic.slug}`} className="w-32 flex-shrink-0">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface" style={{ backgroundColor: comic.dominantColor ?? "#1E1E1E" }}>
              <Image src={comic.coverImage} alt={comic.title} fill sizes="128px" className="object-cover" />
              <span className="absolute right-1.5 top-1.5 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] text-primary-foreground">پایان‌یافته</span>
            </div>
            <p className="mt-1.5 truncate text-xs text-text-main">{comic.title}</p>
            <p className="text-[10px] text-text-muted">{comic.chapterCount.toLocaleString("fa-IR")} چپتر</p>
          </Link>
        ))}
      </div>
    </section>
  );
}