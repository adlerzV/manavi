import Link from "next/link";

export function StaffOverview({ firstName }: { firstName: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-6">
        <p className="text-sm text-text-main">سلام {firstName} 👋</p>
        <p className="mt-1 text-sm text-text-muted">
          شما به‌عنوان عضو تیم به این ناشر متصل هستید. اطلاعات مالی و رویالتی فقط برای ناشر اصلی قابل مشاهده است.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/publisher/comics" className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary">
          <p className="text-sm text-text-main">آثار ناشر</p>
        </Link>
        <Link href="/publisher/comments" className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary">
          <p className="text-sm text-text-main">نظرات</p>
        </Link>
      </div>
    </div>
  );
}