"use client";

import { useEffect, useRef } from "react";
import { reportDevToolsOpen } from "@/app/actions/anti-piracy";

const SIZE_CHECK_INTERVAL_MS = 5000;
const TIMING_CHECK_INTERVAL_MS = 10000;
const SIZE_THRESHOLD_PX = 160;
const TIMING_THRESHOLD_MS = 100;

export function DevToolsGuard() {
  const triggeredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function trigger() {
      if (triggeredRef.current || cancelled) return;
      triggeredRef.current = true;
      reportDevToolsOpen()
        .catch(() => {})
        .finally(() => {
          setTimeout(() => {
            triggeredRef.current = false;
          }, TIMING_CHECK_INTERVAL_MS);
        });
    }

    function checkBySize() {
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      if (widthDelta > SIZE_THRESHOLD_PX || heightDelta > SIZE_THRESHOLD_PX) {
        trigger();
      }
    }

    function checkByTiming() {
      const start = performance.now();
      Function("debugger")();
      if (performance.now() - start > TIMING_THRESHOLD_MS) {
        trigger();
      }
    }

    const sizeInterval = setInterval(checkBySize, SIZE_CHECK_INTERVAL_MS);
    const timingInterval = setInterval(checkByTiming, TIMING_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(sizeInterval);
      clearInterval(timingInterval);
    };
  }, []);

  return null;
}