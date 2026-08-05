import { redirect } from "next/navigation";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { listCommentsPublisher, setCommentStatusPublisher, updateCommentContentPublisher, deleteCommentPublisher } from "@/app/publisher/actions/comment-moderation";
import { CommentModerationTable } from "@/components/moderation/comment-moderation-table";

export default async function PublisherCommentsPage() {
  const user = await getSessionUser();
  const context = await getPublisherContext(user);

  if (!context) {
    if (user?.role !== "ADMIN") redirect("/publisher");
    return (
      <div className="rounded-md border border-border bg-surface p-6 text-sm text-text-muted">
        حساب شما به هیچ ناشری متصل نیست.
      </div>
    );
  }

  const { comments, total } = await listCommentsPublisher({ page: 1 });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">نظرات آثار شما</h1>
      <CommentModerationTable
        initialComments={comments}
        initialTotal={total}
        listAction={listCommentsPublisher}
        setStatusAction={setCommentStatusPublisher}
        updateContentAction={updateCommentContentPublisher}
        deleteAction={deleteCommentPublisher}
      />
    </div>
  );
}