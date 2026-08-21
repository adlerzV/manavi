"use client";

import { useState } from "react";

interface SafeAvatarProps {
  src?: string | null;
  fallbackText: string;
  size?: number;
  className?: string;
}


export function SafeAvatar({ src, fallbackText, size = 64, className }: SafeAvatarProps) {
  const [broken, setBroken] = useState(false);
  const showFallback = !src || broken;

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-text-main ${className ?? ""}`}
    >
      {showFallback ? (
        <span style={{ fontSize: Math.max(11, Math.round(size * 0.4)) }} className="font-medium">
          {fallbackText.charAt(0)}
        </span>
      ) : (
        <img
          src={src ?? undefined}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}