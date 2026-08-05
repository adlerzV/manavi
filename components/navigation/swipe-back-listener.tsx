"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const EDGE_ZONE_PX = 28;
const MIN_DISTANCE_PX = 60;
const MAX_VERTICAL_DRIFT_PX = 55;
const MAX_DURATION_MS = 600;

export function SwipeBackListener() {
  const router = useRouter();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let tracking = false;

    function handleTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      if (!touch) return;
      const fromRightEdge = window.innerWidth - touch.clientX <= EDGE_ZONE_PX;
      if (!fromRightEdge) {
        tracking = false;
        return;
      }
      tracking = true;
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!tracking) return;
      tracking = false;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const dx = touch.clientX - startX;
      const dy = Math.abs(touch.clientY - startY);
      const duration = Date.now() - startTime;

      if (dx <= -MIN_DISTANCE_PX && dy <= MAX_VERTICAL_DRIFT_PX && duration <= MAX_DURATION_MS) {
        if (window.history.length > 1) {
          router.back();
        }
      }
    }

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [router]);

  return null;
}