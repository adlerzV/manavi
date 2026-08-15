import { listPendingChapters } from "@/app/admin/actions/chapter-approval";
import { ChapterApprovalQueue } from "@/components/admin/chapter-approval-queue";

export default async function AdminChapterApprovalsPage() {
  const chapters = await listPendingChapters();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-main">تایید چپترها</h1>
        <p className="mt-1 text-sm text-text-muted">
          چپترهایی که توسط اعضای تیم بدون تیک آبی ارسال شده‌اند و نیاز به بررسی دارند.
        </p>
      </div>
      <ChapterApprovalQueue initialChapters={chapters} />
    </div>
  );
}