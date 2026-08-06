"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import { motion } from "framer-motion";

interface FeatureSpotlightCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureSpotlightCard({ icon, title, description }: FeatureSpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-surface/50 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-primary/60"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(240px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(0,220,100,0.16), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="relative mt-5 text-base font-semibold text-text-main sm:text-lg">{title}</h3>
      <p className="relative mt-2 text-sm leading-7 text-text-muted">{description}</p>
    </motion.div>
  );
}