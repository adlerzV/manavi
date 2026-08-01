"use client";

import { useState, type MouseEvent } from "react";
import Link from "next/link";
import { LazyPageImage } from "./lazy-page-image";

interface ChapterOption {
  id: string;
  chapterNumber: number;
}

interface ReaderViewProps {
  comicTitle: string;
  comicSlug: string;
  chapterNumber: number;
  pages: string[];
  prevChapterId: string | null;
  nextChapterId: string | null;
  allChapters: ChapterOption[];
}

export function ReaderView({
  comicTitle,
  comicSlug,
  chapterNumber,
  pages,
  prevChapterId,
  nextChapterId,
  allChapters,
}: ReaderViewProps) {
  const [controlsVisible, setControlsVisible] = useState(false);
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);

  function handleTap(e: MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-reader-controls]")) return;
    setControlsVisible((v) => !v);
    setChapterMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-black" onClick={handleTap}>
      <div
        data-reader-controls
        className={`fixed inset-x-0 top-0 z-20 flex items-center gap-3 bg-black/80 px-4 py-3 backdrop-blur transition-transform duration-200 ${
          controlsVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <Link href={`/comic/${comicSlug}`} className="text-lg text-text-main" aria-label="Back">
          ←
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-text-main">{comicTitle}</p>
          <p className="text-xs text-text-muted">Chapter {chapterNumber}</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {pages.map((src, i) => (
          <LazyPageImage key={src} src={src} alt={`Page ${i + 1}`} eager={i < 3} />
        ))}
      </div>

      <div
        data-reader-controls
        className={`fixed inset-x-0 bottom-0 z-20 bg-black/80 backdrop-blur transition-transform duration-200 ${
          controlsVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {chapterMenuOpen && (
          <div className="max-h-64 overflow-y-auto border-b border-border">
            {allChapters.map((c) => (
              <Link
                key={c.id}
                href={`/read/${c.id}`}
                className={`block px-4 py-2 text-sm ${
                  c.chapterNumber === chapterNumber
                    ? "text-primary"
                    : "text-text-main hover:bg-surface"
                }`}
              >
                Chapter {c.chapterNumber}
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3">
          {prevChapterId ? (
            <Link href={`/read/${prevChapterId}`} className="text-sm text-text-main">
              ← Previous
            </Link>
          ) : (
            <span className="text-sm text-text-muted">← Previous</span>
          )}

          <button
            onClick={() => setChapterMenuOpen((v) => !v)}
            className="text-sm text-text-main"
          >
            Chapter {chapterNumber} ▾
          </button>

          {nextChapterId ? (
            <Link href={`/read/${nextChapterId}`} className="text-sm text-text-main">
              Next →
            </Link>
          ) : (
            <span className="text-sm text-text-muted">Next →</span>
          )}
        </div>
      </div>
    </div>
  );
}