import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { assertLicenseActive, LicenseInactiveError } from "@/lib/license";
import { getChapterAccessList, userHasChapterAccess } from "@/lib/chapters";
import { getSignedImageUrls } from "@/lib/s3";
import { recordChapterView } from "@/lib/analytics";
import { ChapterReader } from "@/components/reader/chapter-reader";
import { LockedChapterGate } from "@/components/reader/locked-chapter-gate";
import { CommentSection } from "@/components/comments/comment-section";
import { getChapterReactionSummary } from "@/app/actions/reactions";

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
      comic: {
        select: { id: true, title: true, slug: true, readingMode: true, contentType: true, license: { select: { publisherId: true } } },
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
    const hasAccess = await userHasChapterAccess(user?.id ?? null, chapterId, user?.role);
    if (!hasAccess) {
      return <LockedChapterGate chapterId={chapterId} coinsBalance={user?.coinsBalance ?? 0} />;
    }
  }

  const sortedChapters = [...accessList].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentIndex = sortedChapters.findIndex((c) => c.id === chapterId);
  const prevChapterId = currentIndex > 0 ? sortedChapters[currentIndex - 1].id : null;
  const nextChapterId = currentIndex >= 0 && currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1].id : null;

  let canReply = user?.role === "ADMIN";
  if (!canReply && user?.publisherProfile) {
    canReply = user.publisherProfile.id === chapter.comic.license.publisherId;
  }
  if (!canReply && user) {
    const staffLink = await prisma.publisherStaff.findFirst({ where: { userId: user.id, publisherId: chapter.comic.license.publisherId } });
    canReply = Boolean(staffLink);
  }

  recordChapterView(chapterId, chapter.comic.id).catch(() => {});

  const [readHistory, pageUrls, reactionData, comments] = await Promise.all([
    user ? prisma.readHistory.findUnique({ where: { userId_comicId: { userId: user.id, comicId: chapter.comic.id } } }) : Promise.resolve(null),
    getSignedImageUrls(chapter.pages),
    getChapterReactionSummary(chapterId, user?.id ?? null),
    prisma.comment.findMany({
      where: { chapterId, parentId: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        content: true,
        isSpoiler: true,
        isStaffReply: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true, username: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          select: { id: true, content: true, isSpoiler: true, isStaffReply: true, createdAt: true, user: { select: { firstName: true, lastName: true, username: true } } },
        },
      },
    }),
  ]);

  const resumeMatch = readHistory?.lastChapterId === chapter.id;

  return (
    <>
      <ChapterReader
        chapterId={chapter.id}
        comicId={chapter.comic.id}
        comicSlug={chapter.comic.slug}
        comicTitle={chapter.comic.title}
        contentType={chapter.comic.contentType}
        chapterNumber={chapter.chapterNumber}
        pages={pageUrls}
        readingMode={chapter.comic.readingMode}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        chapterOptions={sortedChapters.map((c) => ({ id: c.id, chapterNumber: c.chapterNumber, title: c.title }))}
        initialPage={resumeMatch ? readHistory.lastPage : 1}
        initialScrollFraction={resumeMatch ? readHistory.scrollFraction : 0}
        reactionSummary={reactionData.summary}
        initialUserReaction={reactionData.userReaction}
        isAuthenticated={Boolean(user)}
      />
      <div className="bg-background">
        <CommentSection
          chapterId={chapter.id}
          initialComments={comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toISOString(),
            replies: c.replies.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
          }))}
          canReply={canReply}
        />
      </div>
    </>
  );
}