import type { ReactNode } from "react";
import { BottomNav } from "@/components/navigation/bottom-nav";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="pb-[calc(72px+env(safe-area-inset-bottom))]">
      {children}
      <BottomNav />
    </div>
  );
}