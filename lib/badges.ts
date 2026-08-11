export function isNewRelease(latestChapterPublishedAt: Date | null, thresholdHours: number): boolean {
  if (!latestChapterPublishedAt) return false;
  const ageMs = Date.now() - latestChapterPublishedAt.getTime();
  return ageMs <= thresholdHours * 60 * 60 * 1000;
}