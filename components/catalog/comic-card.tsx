import Link from "next/link";
import { SafeCoverImage } from "@/components/ui/safe-cover-image";

interface ComicCardProps {
  slug: string;
  title: string;
  coverImage: string;
  dominantColor: string | null;
  latestChapter: number | null;
  completed?: boolean;
  priority?: boolean;
  readGrey?: boolean;
}

export function ComicCard({
  slug,
  title,
  coverImage,
  dominantColor,
  latestChapter,
  completed = false,
  priority = false,
  readGrey = false,
}: ComicCardProps) {
  return (
    <Link href={`/app/comic/${slug}`} className="group block">
      <div className={`relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface ${readGrey ? "opacity-60" : ""}`}>
        <SafeCoverImage
          src={coverImage}
          alt={title}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="(max-width: 768px) 50vw, 220px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ backgroundImage: `linear-gradient(to top, ${dominantColor ?? "#000000"}, transparent)` }}
        />
        {completed && (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] text-primary-foreground">
            پایان‌یافته
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-sm font-medium text-white drop-shadow-sm">{title}</p>
          {latestChapter !== null && <p className="text-xs text-white/80 drop-shadow-sm">فصل {latestChapter}</p>}
        </div>
      </div>
    </Link>
  );
}