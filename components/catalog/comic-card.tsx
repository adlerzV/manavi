import Link from "next/link";

interface ComicCardProps {
  slug: string;
  title: string;
  coverImage: string;
  dominantColor: string | null;
  latestChapter: number | null;
}

export function ComicCard({ slug, title, coverImage, dominantColor, latestChapter }: ComicCardProps) {
  return (
    <Link href={`/comic/${slug}`} className="group block">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface">
        <img
          src={coverImage}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            backgroundImage: `linear-gradient(to top, ${dominantColor ?? "#000000"}, transparent)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate text-sm font-medium text-white drop-shadow-sm">{title}</p>
          {latestChapter !== null && (
            <p className="text-xs text-white/80 drop-shadow-sm">Ch. {latestChapter}</p>
          )}
        </div>
      </div>
    </Link>
  );
}