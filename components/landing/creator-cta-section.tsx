"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { CreatorApplicationForm } from "@/components/landing/creator-application-form";
import { HalftoneOverlay } from "./halftone-overlay";

export function CreatorCtaSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="join" className="relative mx-auto max-w-3xl px-4 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-surface/60 p-8 text-center backdrop-blur-sm sm:p-12">
        <HalftoneOverlay opacity={0.05} gap={16} />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent">
            <Sparkles size={13} />
            به تیم مترجمان و طراحان بپیوندید
          </span>

          <h2 className="mx-auto mt-5 max-w-md text-2xl font-bold leading-relaxed text-text-main sm:text-3xl">
            مترجمی؟ طراحی؟ داستان می‌نویسی؟
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-8 text-text-muted">
            پورسانت شفاف، سیستم دونیت مستقیم از خوانندگان و محافظت در برابر سرقت محتوا — کارت رو به هزاران خواننده برسون.
          </p>

          <div className="mt-8">
            <AnimatePresence mode="wait" initial={false}>
              {!open ? (
                <motion.button
                  key="trigger"
                  type="button"
                  onClick={() => setOpen(true)}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="group relative mx-auto inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-l from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">می‌خوام به تیم بپیوندم</span>
                </motion.button>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="overflow-hidden text-right"
                >
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-xs text-text-muted">فرم درخواست همکاری</span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-full p-1.5 text-text-muted hover:bg-background hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      aria-label="بستن فرم"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <CreatorApplicationForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}