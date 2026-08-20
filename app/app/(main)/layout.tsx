import type { ReactNode } from "react";
import { Suspense } from "react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SwipeBackListener } from "@/components/navigation/swipe-back-listener";
import { SiteNoticeBanner } from "@/components/home/site-notice-banner";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">
      <SwipeBackListener />
      <Suspense fallback={null}>
        <SiteNoticeBanner />
      </Suspense>
      {children}
      <BottomNav />
    </div>
  );
}