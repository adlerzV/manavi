import type { ReactNode } from "react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SwipeBackListener } from "@/components/navigation/swipe-back-listener";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">
      <SwipeBackListener />
      {children}
      <BottomNav />
    </div>
  );
}