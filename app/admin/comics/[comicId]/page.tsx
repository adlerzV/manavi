import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSignedImageUrls } from "@/lib/s3";
import { getAllGenres } from "@/lib/genres";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { UploadChapterForm } from "@/components/admin/upload-chapter-form";
import { ChapterStatusPanel } from "@/components/admin/chapter-status-panel";
import { ChapterThumbnailCropper } from "@/components/admin/chapter-thumbnail-cropper";
import { EditComicForm } from "@/components/admin/edit-comic-form";
import { EditChapterForm } from "@/components/admin/edit-chapter-form";
import { ChapterPagesManager } from "@/components/admin/chapter-pages-manager";

interface PageProps {
  params: Promise<{ comicId: string }>;
}

export default async function AdminComicDetailPage({ params }: PageProps) {
  const { comicId } = await params;

  const comic = await prisma.comic.findUnique({
    where: { id: comicId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      bannerImage: true,
      licenseId: true,
      ageRating: true,
      contentType: true,
      readingMode: true,
      isFeaturedOnHome: true,
      featuredBadge: true,
      genres: { select: { genreId: true } },
      chapters: {
        orderBy: { chapterNumber: "desc" },
        select: { id: true, chapterNumber: true, title: true, status: true, scheduledAt: true, isLocked: true, pages: true },
      },
    },
  });

  if (!comic) notFound();

  const [licenses, genres] = await Promise.all([
    prisma.license.findMany({
      where: { status: { notIn: ["EXPIRED", "TERMINATED"] } },
      include: { publisher: { select: { name: true } } },
    }),
    getAllGenres(),
  ]);
  const licenseOptions = licenses.map((l) => ({ id: l.id, publisherName: l.publisher.name, territory: l.territory, status: l.status }));

  const chaptersWithPreviews = await Promise.all(
    comic.chapters.map(async (ch) => ({
      ...ch,
      previewUrls: ch.pages.length ? await getSignedImageUrls(ch.pages, 900) : [],
    }))
  );

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-text-main">{comic.title}</h1>

      <CollapsibleSection triggerLabel="ویرایش اطلاعات عنوان" defaultOpen>
        {(close) => (
          <EditComicForm
            comic={comic}
            licenses={licenseOptions}
            genres={genres.map((g) => ({ id: g.id, name: g.name }))}
            initialGenreIds={comic.genres.map((g) => g.genreId)}
            onSaved={close}
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection triggerLabel="آپلود چپتر جدید">
        {(close) => <UploadChapterForm comics={[{ id: comic.id, title: comic.title }]} onCreated={close} />}
      </CollapsibleSection>

      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">چپترها</h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {chaptersWithPreviews.map((ch) => (
            <div key={ch.id} className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-main">
                  چپتر {ch.chapterNumber}{ch.title ? ` — ${ch.title}` : ""}
                  {ch.isLocked && <span className="mr-2 text-xs text-accent">(قفل دستی)</span>}
                </span>
                <ChapterStatusPanel chapterId={ch.id} status={ch.status} scheduledAt={ch.scheduledAt ? ch.scheduledAt.toISOString() : null} />
              </div>
              <EditChapterForm chapterId={ch.id} initialTitle={ch.title} initialChapterNumber={ch.chapterNumber} initialIsLocked={ch.isLocked} />
              <ChapterThumbnailCropper chapterId={ch.id} />
              <ChapterPagesManager chapterId={ch.id} pageKeys={ch.pages} previewUrls={ch.previewUrls} />
            </div>
          ))}
          {comic.chapters.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز چپتری آپلود نشده.</p>}
        </div>
      </div>
    </div>
  );
}