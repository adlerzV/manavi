import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAllGenres } from "@/lib/genres";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { UploadChapterForm } from "@/components/admin/upload-chapter-form";
import { EditComicForm } from "@/components/admin/edit-comic-form";
import { ChapterListManager } from "@/components/admin/chapter-list-manager";
import { ComicDeleteButton } from "@/components/admin/comic-delete-button";

interface PageProps {
  params: Promise<{ comicId: string }>;
}

export default async function AdminComicDetailPage({ params }: PageProps) {
  const { comicId } = await params;

  const [comic, licenses, genres] = await Promise.all([
    prisma.comic.findUnique({
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
          select: {
            id: true,
            chapterNumber: true,
            title: true,
            status: true,
            scheduledAt: true,
            isLocked: true,
            pages: true,
            accessType: true,
          },
        },
      },
    }),
    prisma.license.findMany({
      where: { status: { notIn: ["EXPIRED", "TERMINATED"] } },
      include: { publisher: { select: { name: true } } },
    }),
    getAllGenres(),
  ]);

  if (!comic) notFound();

  const licenseOptions = licenses.map((l) => ({
    id: l.id,
    publisherName: l.publisher.name,
    territory: l.territory,
    status: l.status,
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-text-main">{comic.title}</h1>
        <ComicDeleteButton comicId={comic.id} comicTitle={comic.title} />
      </div>

      <CollapsibleSection triggerLabel="ویرایش اطلاعات عنوان" defaultOpen>
        <EditComicForm
          comic={comic}
          licenses={licenseOptions}
          genres={genres.map((g) => ({ id: g.id, name: g.name }))}
          initialGenreIds={comic.genres.map((g) => g.genreId)}
        />
      </CollapsibleSection>

      <CollapsibleSection triggerLabel="آپلود چپتر جدید">
        <UploadChapterForm comics={[{ id: comic.id, title: comic.title }]} />
      </CollapsibleSection>

      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">چپترها ({comic.chapters.length.toLocaleString("fa-IR")})</h2>
        <ChapterListManager
          chapters={comic.chapters.map((ch) => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            status: ch.status,
            scheduledAt: ch.scheduledAt ? ch.scheduledAt.toISOString() : null,
            isLocked: ch.isLocked,
            pages: ch.pages,
            accessType: ch.accessType,
          }))}
        />
      </div>
    </div>
  );
}