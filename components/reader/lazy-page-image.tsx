"use client";

import { useEffect, useRef, useState } from "react";

interface LazyPageImageProps {
  src: string;
  alt: string;
  eager: boolean;
}

export function LazyPageImage({ src, alt, eager }: LazyPageImageProps) {
  const [shouldLoad, setShouldLoad] = useState(eager);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager || shouldLoad) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, shouldLoad]);

  return (
    <div ref={ref} className="w-full">
      {shouldLoad ? (
        <img src={src} alt={alt} className="block w-full" loading={eager ? "eager" : "lazy"} />
      ) : (
        <div className="aspect-[2/3] w-full bg-surface" />
      )}
    </div>
  );
}