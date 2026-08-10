import { notFound, redirect } from "next/navigation";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { UploadChapterForm } from "@/components/admin/upload-chapter-form";
import { ChapterStatusPanel } from "@/components/admin/chapter-status-panel";
import { ChapterThumbnailCropper } from "@/components/admin/chapter-thumbnail-cropper";
import { EditChapterForm } from "@/components/admin/edit-chapter-form";
import { ChapterPagesLazy } from "@/components/admin/chapter-pages-lazy";

interface PageProps {
  params: Promise<{ comicId: string }>;
}

export default async function PublisherComicDetailPage({ params }: PageProps) {
  const { comicId } = await params;
  const user = await getSessionUser();
  const context = await getPublisherContext(user);
  if (!context) redirect("/publisher");

  const comic = await prisma.comic.findUnique({
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
          coinCost: true,
        },
      },
    },
  });
  if (!comic) notFound();
  if (comic.license.publisherId !== context.publisherId) redirect("/publisher/comics");

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-text-main">{comic.title}</h1>
      <CollapsibleSection triggerLabel="آپلود چپتر جدید">
        <UploadChapterForm comics={[{ id: comic.id, title: comic.title }]} />
      </CollapsibleSection>
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">چپترها</h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {comic.chapters.map((ch) => (
            <div key={ch.id} className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-main">چپتر {ch.chapterNumber}{ch.title ? ` — ${ch.title}` : ""}</span>
                <ChapterStatusPanel
                  chapterId={ch.id}
                  status={ch.status}
                  scheduledAt={ch.scheduledAt ? ch.scheduledAt.toISOString() : null}
                  chapterLabel={`چپتر ${ch.chapterNumber}${ch.title ? ` — ${ch.title}` : ""}`}
                />
              </div>
              <EditChapterForm
                chapterId={ch.id}
                initialTitle={ch.title}
                initialChapterNumber={ch.chapterNumber}
                initialIsLocked={ch.isLocked}
                initialAccessType={ch.accessType}
                initialCoinCost={ch.coinCost}
              />
              <ChapterThumbnailCropper chapterId={ch.id} />
              <ChapterPagesLazy chapterId={ch.id} pageKeys={ch.pages} />
            </div>
          ))}
          {comic.chapters.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز چپتری آپلود نشده.</p>}
        </div>
      </div>
    </div>
  );
}