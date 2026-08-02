"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, PlayCircle, PauseCircle } from "lucide-react";
import { updateReadHistory } from "@/app/actions/read-history";

interface ChapterOption {
  id: string;
  chapterNumber: number;
  title: string | null;
}

interface ChapterReaderProps {
  chapterId: string;
  comicId: string;
  comicSlug: string;
  comicTitle: string;
  chapterNumber: number;
  pages: string[];
  prevChapterId: string | null;
  nextChapterId: string | null;
  chapterOptions: ChapterOption[];
  initialPage: number;
}

const SCROLL_SPEEDS = [0.5, 1, 1.5, 2, 3];

export function ChapterReader({
  chapterId,
  comicId,
  comicSlug,
  comicTitle,
  chapterNumber,
  pages,
  prevChapterId,
  nextChapterId,
  chapterOptions,
  initialPage,
}: ChapterReaderProps) {
  const router = useRouter();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [autoScroll, setAutoScroll] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoScrollFrame = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const index = Number((visible.target as HTMLElement).dataset.pageIndex);
          if (!Number.isNaN(index)) {
            setCurrentPage(index + 1);
          }
        }
      },
      { threshold: [0.5] }
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pages.length]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      updateReadHistory(comicId, chapterId, currentPage).catch(() => {});
    }, 2000);
    return () => clearTimeout(timeout);
  }, [currentPage, comicId, chapterId]);

  useEffect(() => {
    if (!autoScroll) {
      if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current);
      return;
    }

    const speed = SCROLL_SPEEDS[speedIndex];
    function step() {
      window.scrollBy(0, speed);
      autoScrollFrame.current = requestAnimationFrame(step);
    }
    autoScrollFrame.current = requestAnimationFrame(step);

    return () => {
      if (autoScrollFrame.current) cancelAnimationFrame(autoScrollFrame.current);
    };
  }, [autoScroll, speedIndex]);

  const toggleControls = useCallback(() => {
    setControlsVisible((prev) => !prev);
  }, []);

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
        <div className="w-6" />
      </div>

      <div onClick={toggleControls} className="mx-auto flex max-w-2xl flex-col">
        {pages.map((url, index) => (
          <div
            key={url}
            data-page-index={index}
            ref={(el) => {
              pageRefs.current[index] = el;
            }}
            className="relative w-full"
          >
            <Image
              src={url}
              alt={`صفحه ${index + 1}`}
              width={800}
              height={1200}
              sizes="(max-width: 768px) 100vw, 700px"
              className="h-auto w-full"
              priority={index < 3}
              loading={index < 3 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

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

      <div
        className={`fixed left-4 top-20 z-40 flex flex-col items-center gap-2 transition-opacity duration-200 ${
          controlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setAutoScroll((prev) => !prev);
          }}
          className="rounded-full bg-black/70 p-2 text-white"
        >
          {autoScroll ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
        </button>
        {autoScroll && (
          <select
            value={speedIndex}
            onChange={(e) => setSpeedIndex(Number(e.target.value))}
            className="rounded-md bg-black/70 px-1 py-1 text-xs text-white"
          >
            {SCROLL_SPEEDS.map((speed, index) => (
              <option key={speed} value={index} className="text-black">
                {speed}x
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}