"use client";

import { useState } from "react";
import { SkippableChapterAd } from "./skippable-chapter-ad";

export function ChapterAdSlot() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return <SkippableChapterAd onClose={() => setDismissed(true)} />;
}