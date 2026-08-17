import { listPendingChapters } from "@/app/admin/actions/chapter-approval";
import { listPendingComics } from "@/app/admin/actions/comic-approval";
import { ChapterApprovalQueue } from "@/components/admin/chapter-approval-queue";
import { ComicApprovalQueue } from "@/components/admin/comic-approval-queue";

export default async function AdminChapterApprovalsPage() {
  const [chapters, comics] = await Promise.all([listPendingChapters(), listPendingComics()]);
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-text-main">تایید محتوا</h1>
        <p className="mt-1 text-sm text-text-muted">عناوین و چپترهایی که توسط اعضای تیم بدون تیک آبی ارسال شده‌اند.</p>
      </div>
      <div>
        <h2 className="mb-3 text-lg font-medium text-text-main">عناوین در انتظار تایید</h2>
        <ComicApprovalQueue initialComics={comics} />
      </div>
      <div>
        <h2 className="mb-3 text-lg font-medium text-text-main">چپترها در انتظار تایید</h2>
        <ChapterApprovalQueue initialChapters={chapters} />
      </div>
    </div>
  );
}