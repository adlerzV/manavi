import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";
import { getChapterAccessList, userHasChapterAccess } from "@/lib/chapters";
import { ChapterReader } from "@/components/reader/chapter-reader";
import { LockedChapterGate } from "@/components/reader/locked-chapter-gate";
import { CommentSection } from "@/components/comments/comment-section";

interface PageProps {
  params: Promise<{ chapterId: string }>;
}

export default async function ReadChapterPage({ params }: PageProps) {
  const { chapterId } = await params;

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      chapterNumber: true,
      title: true,
      pages: true,
      publishedAt: true,
      comic: { select: { id: true, title: true, slug: true } },
    },
  });

  if (!chapter || !chapter.publishedAt) {
    notFound();
  }

  try {
    await assertLicenseActive(chapter.comic.id);
  } catch (err) {
    if (err instanceof LicenseInactiveError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
          <p className="text-sm text-text-muted">این عنوان موقتاً در دسترس نیست.</p>
        </div>
      );
    }
    throw err;
  }

  const user = await getSessionUser();
  const accessList = await getChapterAccessList(chapter.comic.id);
  const entry = accessList.find((c) => c.id === chapterId);
  const locked = entry?.locked ?? false;

  if (locked) {
    const hasAccess = await userHasChapterAccess(user?.id ?? null, chapterId);
    if (!hasAccess) {
      return <LockedChapterGate chapterId={chapterId} coinsBalance={user?.coinsBalance ?? 0} />;
    }
  }

  const sortedChapters = [...accessList].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex((c) => c.id === chapterId);
  const prevChapterId = currentIndex > 0 ? sortedChapters[currentIndex - 1].id : null;
  const nextChapterId =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1].id : null;

  const readHistory = user
    ? await prisma.readHistory.findUnique({
        where: { userId_comicId: { userId: user.id, comicId: chapter.comic.id } },
      })
    : null;

  const comments = await prisma.comment.findMany({
    where: { chapterId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      content: true,
      isSpoiler: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true, username: true } },
    },
  });

  return (
    <>
      <ChapterReader
        chapterId={chapter.id}
        comicId={chapter.comic.id}
        comicSlug={chapter.comic.slug}
        comicTitle={chapter.comic.title}
        chapterNumber={chapter.chapterNumber}
        pages={chapter.pages}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        chapterOptions={sortedChapters.map((c) => ({ id: c.id, chapterNumber: c.chapterNumber, title: c.title }))}
        initialPage={readHistory?.lastChapterId === chapter.id ? readHistory.lastPage : 1}
      />
      <div className="bg-background">
        <CommentSection
          chapterId={chapter.id}
          initialComments={comments.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
        />
      </div>
    </>
  );
}