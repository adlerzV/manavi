import { notFound } from "next/navigation";
import Link from "next/link";
import type { ComicStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ComicCard } from "@/components/catalog/comic-card";
import { getAllowedAgeRatings } from "@/lib/content-filter";
import { getVisibleGenres } from "@/lib/genres";
import { getCategoryBySlug } from "@/lib/categories";
import { resolveExploreWhere } from "@/lib/explore";

export const revalidate = 300;

const PAGE_SIZE = 24;

const STATUS_OPTIONS: { value: ComicStatus; label: string }[] = [
  { value: "ONGOING", label: "در حال انتشار" },
  { value: "COMPLETED", label: "پایان‌یافته" },
  { value: "HIATUS", label: "متوقف‌شده" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "popular", label: "محبوب‌ترین" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ genre?: string; status?: string; sort?: string; page?: string }>;
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const category = await getCategoryBySlug(type);
  if (!category) {
    notFound();
  }

  const { genre, status: statusParam, sort: sortParam, page: pageParam } = await searchParams;
  const allowedRatings = await getAllowedAgeRatings();

  const status = STATUS_OPTIONS.some((s) => s.value === statusParam) ? (statusParam as ComicStatus) : undefined;
  const sort: SortOption = sortParam === "popular" ? "popular" : "newest";
  const page = Math.max(1, Number(pageParam) || 1);

  const where = await resolveExploreWhere({ categorySlug: type, genreIds: genre ? [genre] : undefined, status });
  const orderBy = sort === "popular" ? { viewCount: "desc" as const } : { createdAt: "desc" as const };

  function buildHref(overrides: { genre?: string; status?: ComicStatus; sort?: SortOption; page?: number }): string {
    const nextGenre = "genre" in overrides ? overrides.genre : genre;
    const nextStatus = "status" in overrides ? overrides.status : status;
    const nextSort = overrides.sort ?? sort;
    const nextPage = overrides.page ?? 1;

    const qp = new URLSearchParams();
    if (nextGenre) qp.set("genre", nextGenre);
    if (nextStatus) qp.set("status", nextStatus);
    if (nextSort !== "newest") qp.set("sort", nextSort);
    if (nextPage > 1) qp.set("page", String(nextPage));

    const qs = qp.toString();
    return `/app/category/${type}${qs ? `?${qs}` : ""}`;
  }

  const [genres, comics, total] = await Promise.all([
    getVisibleGenres(allowedRatings),
    prisma.comic.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        dominantColor: true,
        chapters: {
          where: { publishedAt: { not: null } },
          orderBy: { chapterNumber: "desc" },
          take: 1,
          select: { chapterNumber: true },
        },
      },
    }),
    prisma.comic.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-xl font-semibold text-text-main">{category.name}</h1>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Link
            href={buildHref({ status: undefined })}
            className={`rounded-full px-3 py-1 text-xs ${!status ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted"}`}
          >
            همه وضعیت‌ها
          </Link>
          {STATUS_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref({ status: option.value })}
              className={`rounded-full px-3 py-1 text-xs ${status === option.value ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted"}`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {SORT_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={buildHref({ sort: option.value })}
              className={`rounded-full px-3 py-1 text-xs ${sort === option.value ? "bg-primary text-primary-foreground" : "bg-surface text-text-muted"}`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        {genres.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <Link
              href={buildHref({ genre: undefined })}
              className={`rounded-full px-3 py-1 text-xs ${!genre ? "bg-primary/10 text-primary" : "bg-surface text-text-muted"}`}
            >
              همه ژانرها
            </Link>
            {genres.map((g) => (
              <Link
                key={g.id}
                href={buildHref({ genre: g.id })}
                className={`rounded-full px-3 py-1 text-xs ${genre === g.id ? "bg-primary/10 text-primary" : "bg-surface text-text-muted"}`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {comics.map((comic, index) => (
            <ComicCard
              key={comic.id}
              slug={comic.slug}
              title={comic.title}
              coverImage={comic.coverImage}
              dominantColor={comic.dominantColor}
              latestChapter={comic.chapters[0]?.chapterNumber ?? null}
              priority={index < 4}
            />
          ))}
          {comics.length === 0 && <p className="col-span-full text-sm text-text-muted">موردی یافت نشد.</p>}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between text-xs text-text-muted">
            <Link
              href={buildHref({ page: page - 1 })}
              className={`rounded-md border border-border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-30" : "hover:border-primary"}`}
            >
              قبلی
            </Link>
            <span>صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}</span>
            <Link
              href={buildHref({ page: page + 1 })}
              className={`rounded-md border border-border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-30" : "hover:border-primary"}`}
            >
              بعدی
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}