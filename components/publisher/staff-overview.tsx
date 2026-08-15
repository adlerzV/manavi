import Link from "next/link";
import { getStaffOverviewStats } from "@/app/publisher/actions/overview";

export async function StaffOverview({ firstName }: { firstName: string }) {
  const stats = await getStaffOverviewStats();

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-6">
        <p className="text-sm text-text-main">درود {firstName} </p>
        <p className="mt-1 text-sm text-text-muted">
           به‌عنوان عضو تیم به این ناشر متصل هستید.
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-primary">{stats.uploadedChapters.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-text-muted">چپتر منتشرشده من</p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-accent">{stats.pendingChapters.toLocaleString("fa-IR")}</p>
            <p className="mt-1 text-xs text-text-muted">در انتظار تایید</p>
          </div>
          <div className="rounded-md border border-border bg-surface p-4 text-center">
            <p className="text-2xl font-semibold text-primary">{stats.totalDonationsTon} TON</p>
            <p className="mt-1 text-xs text-text-muted">دونیت دریافتی</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Link href="/publisher/comics" className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary">
          <p className="text-sm text-text-main">آثار ناشر</p>
        </Link>
        <Link href="/publisher/comments" className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary">
          <p className="text-sm text-text-main">نظرات</p>
        </Link>
        <Link href="/app/profile" className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary">
          <p className="text-sm text-text-main">تنظیم کیف پول</p>
        </Link>
        <Link href="/publisher/comics" className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary">
          <p className="text-sm text-text-main">آپلود چپتر جدید</p>
        </Link>
      </div>
    </div>
  );
}