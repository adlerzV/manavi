import Link from "next/link";
import type { ContentType } from "@prisma/client";
import type { HomeFeedComic } from "@/lib/home-feed";
import { HomeComicCard } from "@/components/catalog/home-comic-card";
import { CONTENT_TYPE_LABELS } from "@/lib/reading";

interface CategoryRowSectionProps {
  contentType: ContentType;
  comics: HomeFeedComic[];
}

export function CategoryRowSection({ contentType, comics }: CategoryRowSectionProps) {
  if (comics.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-medium text-text-main">{CONTENT_TYPE_LABELS[contentType]}</h2>
        <Link href={`/app/category/${contentType.toLowerCase()}`} className="text-xs text-primary">
          نمایش بیشتر
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {comics.map((comic) => (
          <HomeComicCard key={comic.id} slug={comic.slug} title={comic.title} coverImage={comic.coverImage} latestChapter={comic.latestChapter} />
        ))}
      </div>
    </section>
  );
}