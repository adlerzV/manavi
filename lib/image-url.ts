import "server-only";

function getAllowedImageHosts(): Set<string> {
  const hosts = new Set<string>();
  for (const raw of [process.env.S3_PUBLIC_BASE_URL, process.env.STORAGE_CDN_BASE_URL]) {
    if (!raw) continue;
    try {
      hosts.add(new URL(raw).hostname);
    } catch {}
  }
  for (const h of (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "").split(",")) {
    const trimmed = h.trim();
    if (trimmed) hosts.add(trimmed);
  }
  return hosts;
}

export function isAllowedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return getAllowedImageHosts().has(parsed.hostname);
  } catch {
    return false;
  }
}