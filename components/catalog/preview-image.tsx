"use client";

import { useState } from "react";
import Image from "next/image";

export function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="flex w-full items-center justify-center bg-surface py-16 text-xs text-text-muted" style={{ aspectRatio: "2 / 3" }}>
        تصویر در دسترس نیست
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ aspectRatio: "2 / 3" }}>
      <Image src={src} alt={alt} fill sizes="600px" unoptimized className="object-cover" onError={() => setBroken(true)} />
    </div>
  );
}