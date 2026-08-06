"use client";

import { motion, useReducedMotion } from "framer-motion";

export function HeroIconGlow() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden
      className="absolute -inset-4 rounded-2xl will-change-transform"
      style={{
        background: "radial-gradient(circle, rgba(0,220,100,0.55), transparent 70%)",
      }}
      animate={shouldReduceMotion ? undefined : { scale: [1, 1.25, 1], opacity: [0.55, 0.9, 0.55] }}
      transition={shouldReduceMotion ? undefined : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}