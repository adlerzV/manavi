import type { RecommendedComic } from "@/lib/home-feed";
import { HomeComicCard } from "@/components/catalog/home-comic-card";

export function RecommendedSection({ comics }: { comics: RecommendedComic[] }) {
  if (comics.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="mb-3 text-base font-medium text-text-main">پیشنهاد بر اساس سلیقه شما</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {comics.map((comic) => (
          <HomeComicCard
            key={comic.id}
            slug={comic.slug}
            title={comic.title}
            coverImage={comic.coverImage}
            latestChapter={comic.latestChapter}
            completed={comic.completed}
          />
        ))}
      </div>
    </section>
  );
}