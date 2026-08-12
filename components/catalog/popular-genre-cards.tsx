import Link from "next/link";
import Image from "next/image";
import type { PopularGenre } from "@/lib/genres";

export function PopularGenreCards({ genres }: { genres: PopularGenre[] }) {
  if (genres.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/app/explore?genres=${genre.id}`}
          className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface"
        >
          {genre.imageUrl ? (
            <Image
              src={genre.imageUrl}
              alt={genre.name}
              fill
              sizes="(max-width: 768px) 50vw, 220px"
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-text-muted">{genre.name.charAt(0)}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3">
            <p className="text-sm font-medium text-white">{genre.name}</p>
            <p className="text-[11px] text-white/70">{genre.comicCount.toLocaleString("fa-IR")} اثر</p>
          </div>
        </Link>
      ))}
    </div>
  );
}