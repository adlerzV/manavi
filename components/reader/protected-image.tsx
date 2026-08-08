"use client";

import { useMemo, useState, useEffect, memo } from "react";
import Image from "next/image";

interface ProtectedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  sizes?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  watermarkLabel?: string | null;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function ProtectedImageInner({
  src,
  alt,
  priority,
  loading,
  sizes,
  fill,
  width,
  height,
  className,
  watermarkLabel,
}: ProtectedImageProps) {
  const [loaded, setLoaded] = useState(false);

  // ریست کردن وضعیت loaded هنگام تغییر src (مثلاً ناوبری بین چپترها یا Re-use کامپوننت)
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  // فقط یک‌بار به ازای تغییر watermarkLabel محاسبه می‌شود، نه روی هر فریم اسکرول
  const watermarkBackgroundImage = useMemo(() => {
    if (!watermarkLabel) return null;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='160'><text x='0' y='90' transform='rotate(-28 130 80)' font-size='20' fill='white' font-family='sans-serif'>${escapeXml(
      watermarkLabel
    )}</text></svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }, [watermarkLabel]);

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className={fill ? "absolute inset-0" : "relative"}
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-white/5"
          style={!fill ? { aspectRatio: width && height ? `${width} / ${height}` : "2 / 3" } : undefined}
        />
      )}
      <Image
        src={src}
        alt={alt}
        priority={priority}
        loading={loading}
        sizes={sizes}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        unoptimized
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        className={`pointer-events-none select-none transition-opacity duration-200 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className ?? ""}`}
      />
      {watermarkBackgroundImage && loaded && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]"
          style={{ backgroundImage: watermarkBackgroundImage, backgroundRepeat: "repeat" }}
        />
      )}
    </div>
  );
}

export const ProtectedImage = memo(ProtectedImageInner);