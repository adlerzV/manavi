import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { AgeGate } from "@/components/catalog/age-gate";
import { BookmarkButton } from "@/components/catalog/bookmark-button";
import { getChapterAccessList } from "@/lib/chapters";
import { CONTENT_TYPE_LABELS } from "@/lib/reading";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ComicDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const comic = await prisma.comic.findUnique({
    where: { slug },
    include: {
      license: { select: { status: true } },
      genres: { include: { genre: true } },
      staff: { include: { user: { select: { id: true, firstName: true, username: true } } } },
    },
  });

  if (!comic) {
    notFound();
  }

  const [chapterAccess, user] = await Promise.all([getChapterAccessList(comic.id), getSessionUser()]);

  const sortedChapters = [...chapterAccess].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const licenseActive = comic.license.status === "ACTIVE";
  const firstChapter = sortedChapters[0];

  const bookmarked = user
    ? Boolean(
        await prisma.bookmark.findUnique({
          where: { userId_comicId: { userId: user.id, comicId: comic.id } },
        })
      )
    : false;

  const content = (
    <>
      <div className="relative">
        {comic.bannerImage && (
          <Image
            src={comic.bannerImage}
            alt=""
            width={1200}
            height={400}
            className="h-40 w-full object-cover opacity-60 sm:h-56"
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-24"
          style={{ backgroundImage: "linear-gradient(to top, #121212, transparent)" }}
        />
      </div>

      <div className="mx-auto -mt-16 max-w-4xl px-4 pb-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Image
            src={comic.coverImage}
            alt={comic.title}
            width={160}
            height={224}
            className="h-56 w-40 flex-shrink-0 rounded-md object-cover shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-text-main">{comic.title}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-text-muted">
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-primary">
                {CONTENT_TYPE_LABELS[comic.contentType]}
              </span>
              <span>{comic.status}</span>
              <span>·</span>
              <span>{sortedChapters.length} چپتر</span>
            </p>
            {comic.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {comic.genres.map(({ genre }) => (
                  <span key={genre.id} className="rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm text-text-muted">{comic.description}</p>

        <div className="mt-4 flex items-center gap-3">
          {licenseActive && firstChapter && (
            <Link
              href={`/app/read/${firstChapter.id}`}
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
            >
              شروع خواندن
            </Link>
          )}
          <BookmarkButton comicId={comic.id} comicSlug={comic.slug} initialBookmarked={bookmarked} />
        </div>

        {!licenseActive && (
          <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            این عنوان موقتاً در دسترس نیست.
          </p>
        )}

        {comic.staff.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-2 text-sm font-medium text-text-main">تیم این عنوان</h2>
            <div className="flex flex-wrap gap-2">
              {comic.staff.map((s) => (
                <Link
                  key={s.id}
                  href={`/app/team/${s.user.id}`}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-text-main hover:border-primary"
                >
                  {s.user.username ? `@${s.user.username}` : s.user.firstName}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 divide-y divide-border rounded-md border border-border">
          {licenseActive && sortedChapters.length > 0 ? (
            sortedChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/app/read/${chapter.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface"
              >
                <span className="text-text-main">
                  چپتر {chapter.chapterNumber}
                  {chapter.title ? ` — ${chapter.title}` : ""}
                </span>
                {chapter.locked && <span className="text-xs text-accent">ویژه مشترکین</span>}
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-text-muted">در حال حاضر چپتری موجود نیست.</p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <main className="min-h-screen bg-background">
      {comic.ageRating === "NORMAL" ? content : <AgeGate>{content}</AgeGate>}
    </main>
  );
}