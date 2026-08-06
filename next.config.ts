import type { NextConfig } from "next";

function buildRemotePatterns() {
  const patterns: { protocol: "https"; hostname: string }[] = [];

  if (process.env.S3_PUBLIC_BASE_URL) {
    try {
      const hostname = new URL(process.env.S3_PUBLIC_BASE_URL).hostname;
      patterns.push({ protocol: "https", hostname });
    } catch {}
  }

  const extraHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  for (const hostname of extraHosts) {
    patterns.push({ protocol: "https", hostname });
  }

  return patterns.length > 0 ? patterns : [{ protocol: "https" as const, hostname: "**" }];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: buildRemotePatterns(),
  },
};

export default nextConfig;