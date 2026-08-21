"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageErrorBoundary } from "./image-error-boundary";

interface SafeCoverImageProps extends Omit<ImageProps, "onError"> {
  fallbackClassName?: string;
}

function DefaultFallback({ className }: { className?: string }) {
  return (
    <div className={className ?? "absolute inset-0 flex items-center justify-center bg-surface text-xs text-text-muted"}>
      تصویر در دسترس نیست
    </div>
  );
}

function SafeCoverImageInner({ fallbackClassName, ...imageProps }: SafeCoverImageProps) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <DefaultFallback className={fallbackClassName} />;
  }

  return <Image {...imageProps} onError={() => setBroken(true)} />;
}

export function SafeCoverImage(props: SafeCoverImageProps) {
  return (
    <ImageErrorBoundary fallback={<DefaultFallback className={props.fallbackClassName} />}>
      <SafeCoverImageInner {...props} />
    </ImageErrorBoundary>
  );
}