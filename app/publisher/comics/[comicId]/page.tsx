import { notFound, redirect } from "next/navigation";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { UploadChapterForm } from "@/components/admin/upload-chapter-form";
import { ChapterListManager } from "@/components/admin/chapter-list-manager";
import { listComicStaff } from "@/app/admin/actions/comic-staff";
import { ComicStaffManager } from "@/components/admin/comic-staff-manager";

interface PageProps {
  params: Promise<{ comicId: string }>;
}

export default async function PublisherComicDetailPage({ params }: PageProps) {
  const { comicId } = await params;
  const user = await getSessionUser();
  const context = await getPublisherContext(user);
  if (!context) redirect("/publisher");

  const [comic, comicStaff] = await Promise.all([
    prisma.comic.findUnique({
      where: { id: comicId },
      select: {
        id: true,
        title: true,
        license: { select: { publisherId: true } },
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
    listComicStaff(comicId),
  ]);

  if (!comic) notFound();
  if (comic.license.publisherId !== context.publisherId) redirect("/publisher/comics");

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-text-main">{comic.title}</h1>

      <CollapsibleSection triggerLabel="مدیریت دست‌اندرکاران">
        <ComicStaffManager comicId={comic.id} initialStaff={comicStaff} />
      </CollapsibleSection>

      <CollapsibleSection triggerLabel="آپلود چپتر جدید">
        <UploadChapterForm comics={[{ id: comic.id, title: comic.title }]} restrictAccessTypes />
      </CollapsibleSection>

      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">چپترها</h2>
        <ChapterListManager
          restrictAccessTypes
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