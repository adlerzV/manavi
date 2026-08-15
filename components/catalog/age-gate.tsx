import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/auth";

export async function AgeGate({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (user?.isAgeVerified) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 rounded-md border border-border bg-surface p-8 text-center">
      <p className="text-sm text-text-main">این عنوان محتوای بزرگسال دارد.</p>
      <p className="max-w-xs text-xs text-text-muted">
        برای مشاهدهٔ محتوای ۱۸+، ابتدا از صفحهٔ پروفایل تاییدیهٔ سنی را فعال کنید.
      </p>
      <Link
        href="/app/profile"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        رفتن به تنظیمات پروفایل
      </Link>
    </div>
  );
}