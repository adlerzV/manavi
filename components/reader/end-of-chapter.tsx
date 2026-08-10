"use client";

import Link from "next/link";
import { ChapterReactions } from "./chapter-reactions";
import { ChapterAdSlot } from "./chapter-ad-slot";

interface ReactionSummary { emoji: string; count: number }

interface EndOfChapterProps {
  chapterId: string;
  comicSlug: string;
  nextChapterId: string | null;
  reactionSummary: ReactionSummary[];
  initialUserReaction: string | null;
  isAuthenticated: boolean;
  showAd: boolean;
}

export function EndOfChapter({ chapterId, comicSlug, nextChapterId, reactionSummary, initialUserReaction, isAuthenticated, showAd }: EndOfChapterProps) {
  return (
    <div className="border-t border-white/10 bg-black py-8">
      <p className="mb-4 text-center text-sm text-white/60">پایان چپتر — واکنش نشون بده</p>
      <ChapterReactions chapterId={chapterId} initialSummary={reactionSummary} initialUserReaction={initialUserReaction} isAuthenticated={isAuthenticated} />

      {showAd && <ChapterAdSlot />}

      <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-2 px-4">
        {nextChapterId ? (
          <Link href={`/app/read/${nextChapterId}`} className="rounded-md bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">چپتر بعدی</Link>
        ) : (
          <p className="rounded-md border border-border py-3 text-center text-sm text-white/60">این آخرین چپتر منتشرشده است</p>
        )}
        <Link href={`/app/comic/${comicSlug}`} className="rounded-md border border-border px-4 py-3 text-center text-sm text-text-main">بازگشت به صفحه عنوان</Link>
      </div>
    </div>
  );
}