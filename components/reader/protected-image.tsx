"use client";

import { useState } from "react";
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
}

export function ProtectedImage({ src, alt, priority, loading, sizes, fill, width, height, className }: ProtectedImageProps) {
  const [loaded, setLoaded] = useState(false);

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
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
        onLoad={() => setLoaded(true)}
        className={`pointer-events-none select-none transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
      />
    </div>
  );
}