"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

interface AnimatedHeadlineProps {
  text: string;
  className?: string;
  gradientClassName?: string;
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedHeadline({ text, className, gradientClassName }: AnimatedHeadlineProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (shouldReduceMotion) {
    return (
      <h1 className={className}>
        <span className={gradientClassName}>{text}</span>
      </h1>
    );
  }

  return (
    <motion.h1 variants={container} initial="hidden" animate="visible" className={className}>
      {words.map((w, index) => (
        <motion.span
          key={`${w}-${index}`}
          variants={word}
          className={`inline-block will-change-transform ${gradientClassName ?? ""}`}
        >
          {w}
          {index < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </motion.h1>
  );
}