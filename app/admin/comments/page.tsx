import { listCommentsAdmin, setCommentStatusAdmin, updateCommentContentAdmin, deleteCommentAdmin } from "@/app/admin/actions/comment-moderation";
import { CommentModerationTable } from "@/components/moderation/comment-moderation-table";

export default async function AdminCommentsPage() {
  const { comments, total } = await listCommentsAdmin({ page: 1 });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">مدیریت نظرات</h1>
      <CommentModerationTable
        initialComments={comments}
        initialTotal={total}
        listAction={listCommentsAdmin}
        setStatusAction={setCommentStatusAdmin}
        updateContentAction={updateCommentContentAdmin}
        deleteAction={deleteCommentAdmin}
      />
    </div>
  );
}