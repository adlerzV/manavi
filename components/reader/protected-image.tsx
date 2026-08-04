"use client";

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

export function ProtectedImage({
  src,
  alt,
  priority,
  loading,
  sizes,
  fill,
  width,
  height,
  className,
}: ProtectedImageProps) {
  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className={fill ? "absolute inset-0" : "relative"}
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
    >
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
        className={`pointer-events-none select-none ${className ?? ""}`}
      />
    </div>
  );
}