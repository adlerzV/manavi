"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HalftoneOverlay } from "./halftone-overlay";

interface FloatingPanelCardProps {
  label: string;
  sublabel: string;
  fromColor: string;
  toColor: string;
  rotate: number;
  tiltX: number;
  tiltY: number;
  floatDelay: number;
  floatDuration: number;
  className?: string;
}

export function FloatingPanelCard({
  label,
  sublabel,
  fromColor,
  toColor,
  rotate,
  tiltX,
  tiltY,
  floatDelay,
  floatDuration,
  className,
}: FloatingPanelCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`absolute will-change-transform ${className ?? ""}`}
      style={{ rotateX: tiltX, rotateY: tiltY, rotateZ: rotate, transformStyle: "preserve-3d" }}
      animate={
        shouldReduceMotion
          ? undefined
          : { y: [-12, 12, -12], rotateZ: [rotate - 3, rotate + 3, rotate - 3] }
      }
      transition={
        shouldReduceMotion
          ? undefined
          : { duration: floatDuration, repeat: Infinity, ease: "easeInOut", delay: floatDelay }
      }
    >
      <div
        className="relative h-56 w-40 overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-64 sm:w-44"
        style={{
          backgroundImage: `linear-gradient(155deg, ${fromColor}, ${toColor})`,
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 10px)",
          }}
        />
        <HalftoneOverlay dotColor="255,255,255" opacity={0.16} gap={10} dotSize={1.1} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {label}
          </span>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <p className="text-xs font-medium text-white">{sublabel}</p>
          <p className="text-[10px] text-white/70">چپتر تازه منتشر شد</p>
        </div>
        <div className="pointer-events-none absolute inset-2 rounded-xl border border-white/15" />
      </div>
    </motion.div>
  );
}