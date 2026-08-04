import Link from "next/link";
import Image from "next/image";

interface GenreGridItem {
  id: string;
  name: string;
  imageUrl: string | null;
}

export function GenreGrid({ genres }: { genres: GenreGridItem[] }) {
  if (genres.length === 0) return null;

  return (
    <div className="grid grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-2" style={{ gridAutoColumns: "88px" }}>
      {genres.map((genre) => (
        <Link key={genre.id} href={`/app/explore?genre=${genre.id}`} className="flex flex-col items-center gap-1.5">
          <div className="relative aspect-square w-[72px] overflow-hidden rounded-xl bg-surface">
            {genre.imageUrl ? (
              <Image src={genre.imageUrl} alt={genre.name} fill sizes="72px" className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-text-muted">{genre.name.charAt(0)}</div>
            )}
          </div>
          <span className="w-[72px] truncate text-center text-[11px] text-text-main">{genre.name}</span>
        </Link>
      ))}
    </div>
  );
}