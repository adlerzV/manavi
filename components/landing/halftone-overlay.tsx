"use client";

interface HalftoneOverlayProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  opacity?: number;
}

export function HalftoneOverlay({
  className,
  dotColor = "255,255,255",
  dotSize = 1.4,
  gap = 15,
  opacity = 0.08,
}: HalftoneOverlayProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{
        backgroundImage: `radial-gradient(rgba(${dotColor},${opacity}) ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${gap}px ${gap}px`,
        maskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 0%, transparent 75%)",
      }}
    />
  );
}