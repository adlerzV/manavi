"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface GlowCtaButtonProps {
  href?: string;
  nativeHref?: string;
  children: ReactNode;
}

const MOBILE_UA_PATTERN = /android|iphone|ipad|ipod|iemobile|blackberry|opera mini|mobile/i;
const NATIVE_APP_FALLBACK_MS = 1500;

export function GlowCtaButton({ href, nativeHref, children }: GlowCtaButtonProps) {
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setIsMobile(MOBILE_UA_PATTERN.test(navigator.userAgent));
  }, []);

  function handleClick() {
    if (!href) return;

    if (!isMobile || !nativeHref) {
      window.location.href = href;
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearTimeout(fallbackTimer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };

    const fallbackTimer = setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.location.href = href;
    }, NATIVE_APP_FALLBACK_MS);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.location.href = nativeHref;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!href}
      className="group relative inline-flex rounded-full p-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full will-change-transform"
        style={{
          background: "conic-gradient(from 0deg, #00DC64, #EC4899, #00DC64, #22c55e, #00DC64)",
        }}
        initial={{ rotate: 0 }}
        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
        transition={shouldReduceMotion ? undefined : { duration: 5, repeat: Infinity, ease: "linear" }}
      />
      <span className="relative flex items-center justify-center gap-2 rounded-full bg-background px-8 py-3.5 text-sm font-semibold text-text-main transition-colors group-hover:bg-surface">
        {children}
      </span>
    </button>
  );
}