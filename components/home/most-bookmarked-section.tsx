import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import type { MostBookmarkedComic } from "@/lib/home-feed";

export function MostBookmarkedSection({ comics }: { comics: MostBookmarkedComic[] }) {
  if (comics.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="mb-3 text-base font-medium text-text-main">پربوکمارک‌ترین‌ها</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {comics.map((comic, index) => (
          <Link key={comic.id} href={`/app/comic/${comic.slug}`} className="relative w-32 flex-shrink-0">
            <span className="absolute -right-1 -top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-foreground">
              {(index + 1).toLocaleString("fa-IR")}
            </span>
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface" style={{ backgroundColor: comic.dominantColor ?? "#1E1E1E" }}>
              <Image src={comic.coverImage} alt={comic.title} fill sizes="128px" className="object-cover" />
            </div>
            <p className="mt-1.5 truncate text-xs text-text-main">{comic.title}</p>
            <p className="flex items-center gap-1 text-[10px] text-text-muted">
              <Bookmark size={10} />
              {comic.bookmarkCount.toLocaleString("fa-IR")}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}