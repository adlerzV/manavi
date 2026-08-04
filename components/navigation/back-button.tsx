"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface BackButtonProps {
  fallbackHref: string;
  className?: string;
  variant?: "overlay" | "plain";
}

export function BackButton({ fallbackHref, className, variant = "overlay" }: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  const base =
    variant === "overlay"
      ? "flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
      : "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-main";

  return (
    <button onClick={handleClick} aria-label="بازگشت" className={`${base} ${className ?? ""}`}>
      <ArrowRight size={20} />
    </button>
  );
}