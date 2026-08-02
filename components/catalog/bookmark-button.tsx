"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { useTelegramAuth } from "@/components/providers/telegram-auth-provider";

interface BookmarkButtonProps {
  comicId: string;
  comicSlug: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ comicId, comicSlug, initialBookmarked }: BookmarkButtonProps) {
  const { user } = useTelegramAuth();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!user || pending) return;
    const previous = bookmarked;
    setBookmarked(!previous);
    setPending(true);
    try {
      const result = await toggleBookmark(comicId, comicSlug);
      setBookmarked(result.bookmarked);
    } catch {
      setBookmarked(previous);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!user || pending}
      className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        bookmarked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-text-main"
      }`}
    >
      <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "بوکمارک شده" : "افزودن به بوکمارک"}
    </button>
  );
}