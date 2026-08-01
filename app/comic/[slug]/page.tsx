import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AgeGate } from "@/components/catalog/age-gate";


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
      chapters: {
        where: { publishedAt: { not: null } },
        orderBy: { chapterNumber: "asc" },
        select: { id: true, chapterNumber: true, title: true, isLocked: true },
      },
    },
  });

  if (!comic) {
    notFound();
  }

  const licenseActive = comic.license.status === "ACTIVE";
  const firstChapter = comic.chapters[0];

  const content = (
    <>
      <div className="relative">
        {comic.bannerImage && (
          <img
            src={comic.bannerImage}
            alt=""
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
          <img
            src={comic.coverImage}
            alt={comic.title}
            className="h-56 w-40 flex-shrink-0 rounded-md object-cover shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-text-main">{comic.title}</h1>
            <p className="mt-1 text-sm text-text-muted">
              {comic.status} · {comic.chapters.length} chapters
            </p>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm text-text-muted">{comic.description}</p>

        {!licenseActive && (
          <p className="mt-4 rounded-md border border-border bg-surface px-4 py-3 text-sm text-text-muted">
            This title is temporarily unavailable.
          </p>
        )}

        {licenseActive && firstChapter && (
          <Link
            href={`/read/${firstChapter.id}`}
            className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground"
          >
            Start reading
          </Link>
        )}

        <div className="mt-8 divide-y divide-border rounded-md border border-border">
          {licenseActive && comic.chapters.length > 0 ? (
            comic.chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/read/${chapter.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-surface"
              >
                <span className="text-text-main">
                  Chapter {chapter.chapterNumber}
                  {chapter.title ? ` — ${chapter.title}` : ""}
                </span>
                {chapter.isLocked && (
                  <span className="text-xs text-accent">Subscribers only</span>
                )}
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-text-muted">No chapters available right now.</p>
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
