"use client";

import { useMemo } from "react";

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function WatermarkOverlay({ label }: { label?: string | null }) {
  const backgroundImage = useMemo(() => {
    if (!label) return null;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='160'><text x='0' y='90' transform='rotate(-28 130 80)' font-size='20' fill='white' font-family='sans-serif'>${escapeXml(
      label
    )}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [label]);

  if (!backgroundImage) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20 opacity-[0.14]"
      style={{ backgroundImage, backgroundRepeat: "repeat" }}
    />
  );
}