import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";
import { getSessionUser } from "@/lib/auth";
import { ReaderView } from "@/components/reader/reader-view";

interface PageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ReadChapterPage({ params }: PageProps) {
  const { chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      comic: {
        include: {
          chapters: {
            orderBy: { chapterNumber: "asc" },
            select: { id: true, chapterNumber: true, publishedAt: true },
          },
        },
      },
    },
  });

  if (!chapter || !chapter.publishedAt) {
    notFound();
  }

  try {
    await assertLicenseActive(chapter.comic.id);
  } catch (err) {
    if (err instanceof LicenseInactiveError) {
      notFound();
    }
    throw err;
  }

  if (chapter.isLocked) {
    const user = await getSessionUser();
    if (!user?.isSubscribed) {
      redirect(`/comic/${chapter.comic.slug}?locked=${chapter.chapterNumber}`);
    }
  }

  const publishedChapters = chapter.comic.chapters.filter((c) => c.publishedAt);
  const currentIndex = publishedChapters.findIndex((c) => c.id === chapter.id);
  const prevChapterId = currentIndex > 0 ? publishedChapters[currentIndex - 1].id : null;
  const nextChapterId =
    currentIndex >= 0 && currentIndex < publishedChapters.length - 1
      ? publishedChapters[currentIndex + 1].id
      : null;

  return (
    <ReaderView
      comicTitle={chapter.comic.title}
      comicSlug={chapter.comic.slug}
      chapterNumber={chapter.chapterNumber}
      pages={chapter.pages}
      prevChapterId={prevChapterId}
      nextChapterId={nextChapterId}
      allChapters={publishedChapters.map((c) => ({
        id: c.id,
        chapterNumber: c.chapterNumber,
      }))}
    />
  );
}