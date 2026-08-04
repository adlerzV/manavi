"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReadingMode } from "@prisma/client";
import { updateReadHistory } from "@/app/actions/read-history";
import { VerticalReader } from "./vertical-reader";
import { HorizontalReader } from "./horizontal-reader";
import { ReadingModeToggle } from "./reading-mode-toggle";
import { ChapterReactions } from "./chapter-reactions";
import { getStoredReadingModeOverride, setStoredReadingModeOverride } from "@/lib/reading";

interface ChapterOption {
  id: string;
  chapterNumber: number;
  title: string | null;
}

interface ReactionSummary {
  emoji: string;
  count: number;
}

interface ChapterReaderProps {
  chapterId: string;
  comicId: string;
  comicSlug: string;
  comicTitle: string;
  chapterNumber: number;
  pages: string[];
  readingMode: ReadingMode;
  prevChapterId: string | null;
  nextChapterId: string | null;
  chapterOptions: ChapterOption[];
  initialPage: number;
  initialScrollFraction: number;
  reactionSummary: ReactionSummary[];
  initialUserReaction: string | null;
  isAuthenticated: boolean;
}

export function ChapterReader({
  chapterId,
  comicId,
  comicSlug,
  comicTitle,
  chapterNumber,
  pages,
  readingMode,
  prevChapterId,
  nextChapterId,
  chapterOptions,
  initialPage,
  initialScrollFraction,
  reactionSummary,
  initialUserReaction,
  isAuthenticated,
}: ChapterReaderProps) {
  const router = useRouter();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [effectiveMode, setEffectiveMode] = useState<ReadingMode>(readingMode);
  const [horizontalPage, setHorizontalPage] = useState(initialPage);

  useEffect(() => {
    const stored = getStoredReadingModeOverride(comicId);
    if (stored) setEffectiveMode(stored);
  }, [comicId]);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

  function handleModeChange(mode: ReadingMode) {
    setEffectiveMode(mode);
    setStoredReadingModeOverride(comicId, mode);
  }

  const persistProgress = useCallback(
    (page: number, fraction: number) => {
      updateReadHistory(comicId, chapterId, page, fraction).catch(() => {});
    },
    [comicId, chapterId]
  );

  useEffect(() => {
    if (effectiveMode !== "HORIZONTAL") return;
    const timeout = setTimeout(() => {
      persistProgress(horizontalPage, 0);
    }, 1200);
    return () => clearTimeout(timeout);
  }, [effectiveMode, horizontalPage, persistProgress]);

  return (
    <div className="relative min-h-screen bg-black">
      <div
        className={`fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-sm transition-transform duration-200 ${
          controlsVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link href={`/app/comic/${comicSlug}`} className="text-white">
          <ArrowRight size={22} />
        </Link>
        <div className="text-center">
          <p className="text-sm font-medium text-white">{comicTitle}</p>
          <p className="text-xs text-white/60">چپتر {chapterNumber}</p>
        </div>
        <ReadingModeToggle mode={effectiveMode} onChange={handleModeChange} />
      </div>

      {effectiveMode === "VERTICAL" ? (
        <VerticalReader
          pages={pages}
          initialPage={initialPage}
          initialScrollFraction={initialScrollFraction}
          onProgress={persistProgress}
          onToggleControls={toggleControls}
          controlsVisible={controlsVisible}
        />
      ) : (
        <HorizontalReader
          pages={pages}
          currentPage={horizontalPage}
          onPageChange={setHorizontalPage}
          onRequestPrevChapter={() => prevChapterId && router.push(`/app/read/${prevChapterId}`)}
          onRequestNextChapter={() => nextChapterId && router.push(`/app/read/${nextChapterId}`)}
          hasPrevChapter={Boolean(prevChapterId)}
          hasNextChapter={Boolean(nextChapterId)}
          onToggleControls={toggleControls}
        />
      )}

      {effectiveMode === "VERTICAL" && (
        <div className="bg-black">
          <ChapterReactions
            chapterId={chapterId}
            initialSummary={reactionSummary}
            initialUserReaction={initialUserReaction}
            isAuthenticated={isAuthenticated}
          />
        </div>
      )}

      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-2 bg-black/80 px-4 py-3 backdrop-blur-sm transition-transform duration-200 ${
          controlsVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {prevChapterId ? (
          <Link href={`/app/read/${prevChapterId}`} className="rounded-md bg-white/10 p-2 text-white">
            <ChevronRight size={20} />
          </Link>
        ) : (
          <div className="w-9" />
        )}

        <select
          value={chapterId}
          onChange={(e) => router.push(`/app/read/${e.target.value}`)}
          className="flex-1 rounded-md bg-white/10 px-2 py-2 text-sm text-white"
        >
          {chapterOptions.map((option) => (
            <option key={option.id} value={option.id} className="text-black">
              چپتر {option.chapterNumber}
              {option.title ? ` — ${option.title}` : ""}
            </option>
          ))}
        </select>

        {nextChapterId ? (
          <Link href={`/app/read/${nextChapterId}`} className="rounded-md bg-white/10 p-2 text-white">
            <ChevronLeft size={20} />
          </Link>
        ) : (
          <div className="w-9" />
        )}
      </div>
    </div>
  );
}