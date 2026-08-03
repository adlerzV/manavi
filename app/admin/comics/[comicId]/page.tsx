// app/admin/comics/[comicId]/page.tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UploadChapterForm } from "@/components/admin/Upload-chapter-form";
import { ChapterPublishButton } from "@/components/admin/chapter-publish-button";

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
      chapters: {
        orderBy: { chapterNumber: "desc" },
        select: { id: true, chapterNumber: true, title: true, publishedAt: true },
      },
    },
  });

  if (!comic) notFound();

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-text-main">{comic.title}</h1>
      <UploadChapterForm comics={[{ id: comic.id, title: comic.title }]} />
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">چپترها</h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {comic.chapters.map((ch) => (
            <div key={ch.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-main">
                چپتر {ch.chapterNumber}
                {ch.title ? ` — ${ch.title}` : ""}
              </span>
              {ch.publishedAt ? (
                <span className="text-xs text-primary">منتشرشده</span>
              ) : (
                <ChapterPublishButton chapterId={ch.id} />
              )}
            </div>
          ))}
          {comic.chapters.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز چپتری آپلود نشده.</p>}
        </div>
      </div>
    </div>
  );
}