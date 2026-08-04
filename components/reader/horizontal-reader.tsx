"use client";

import { useCallback, useEffect, useRef } from "react";
import type { TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProtectedImage } from "./protected-image";

interface HorizontalReaderProps {
  pages: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onRequestPrevChapter: () => void;
  onRequestNextChapter: () => void;
  hasPrevChapter: boolean;
  hasNextChapter: boolean;
  onToggleControls: () => void;
}

export function HorizontalReader({
  pages,
  currentPage,
  onPageChange,
  onRequestPrevChapter,
  onRequestNextChapter,
  hasPrevChapter,
  hasNextChapter,
  onToggleControls,
}: HorizontalReaderProps) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const nextIndexes = [currentPage, currentPage + 1];
    nextIndexes.forEach((idx) => {
      const url = pages[idx];
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [currentPage, pages]);

  const goPrev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (hasPrevChapter) {
      onRequestPrevChapter();
    }
  }, [currentPage, hasPrevChapter, onRequestPrevChapter, onPageChange]);

  const goNext = useCallback(() => {
    if (currentPage < pages.length) {
      onPageChange(currentPage + 1);
    } else if (hasNextChapter) {
      onRequestNextChapter();
    }
  }, [currentPage, pages.length, hasNextChapter, onRequestNextChapter, onPageChange]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goPrev();
      if (e.key === "ArrowLeft") goNext();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [goPrev, goNext]);

  function handleTouchStart(e: TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) goPrev();
    else goNext();
  }

  const currentUrl = pages[currentPage - 1];

  return (
    <div
      className="relative h-screen w-full bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {currentUrl && (
        <ProtectedImage
          src={currentUrl}
          alt={`صفحه ${currentPage}`}
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      )}

      <button onClick={goPrev} aria-label="صفحه قبل" className="absolute inset-y-0 right-0 z-20 w-1/3" />
      <button onClick={goNext} aria-label="صفحه بعد" className="absolute inset-y-0 left-0 z-20 w-1/3" />
      <button
        onClick={onToggleControls}
        aria-label="نمایش کنترل‌ها"
        className="absolute inset-y-0 left-1/3 right-1/3 z-10"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-24 flex items-center justify-center gap-1">
        <ChevronRight size={14} className="text-white/40" />
        <span className="text-xs text-white/60">
          {currentPage} / {pages.length}
        </span>
        <ChevronLeft size={14} className="text-white/40" />
      </div>
    </div>
  );
}