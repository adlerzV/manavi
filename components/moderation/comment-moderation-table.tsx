"use client";

import { useState, useTransition } from "react";
import type { CommentStatus } from "@prisma/client";

export interface ModerationCommentRow {
  id: string;
  content: string;
  isSpoiler: boolean;
  isStaffReply: boolean;
  status: CommentStatus;
  createdAt: string;
  editedAt: string | null;
  parentId: string | null;
  user: { firstName: string; lastName: string | null; username: string | null };
  chapter: { id: string; chapterNumber: number; comic: { id: string; title: string; slug: string } };
}

interface ActionResult {
  success: boolean;
  error?: string;
}

interface CommentModerationTableProps {
  initialComments: ModerationCommentRow[];
  initialTotal: number;
  listAction: (params: { status?: CommentStatus; page?: number }) => Promise<{ comments: ModerationCommentRow[]; total: number }>;
  setStatusAction: (commentId: string, status: CommentStatus) => Promise<ActionResult>;
  updateContentAction: (commentId: string, content: string) => Promise<ActionResult>;
  deleteAction: (commentId: string) => Promise<ActionResult>;
}

const STATUS_LABELS: Record<CommentStatus, string> = {
  PENDING: "در انتظار بررسی",
  APPROVED: "تاییدشده",
  REJECTED: "مخفی‌شده",
};

function authorName(user: { firstName: string; lastName: string | null; username: string | null }) {
  return user.username ? `@${user.username}` : `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`;
}

export function CommentModerationTable({
  initialComments,
  initialTotal,
  listAction,
  setStatusAction,
  updateContentAction,
  deleteAction,
}: CommentModerationTableProps) {
  const [comments, setComments] = useState(initialComments);
  const [total, setTotal] = useState(initialTotal);
  const [statusFilter, setStatusFilter] = useState<CommentStatus | "">("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function runSearch(nextPage = 1, status = statusFilter) {
    startTransition(async () => {
      const result = await listAction({ status: status || undefined, page: nextPage });
      setComments(result.comments);
      setTotal(result.total);
      setPage(nextPage);
    });
  }

  function handleStatus(commentId: string, status: CommentStatus) {
    setError(null);
    startTransition(async () => {
      const result = await setStatusAction(commentId, status);
      if (result.success) runSearch(page);
      else setError(result.error ?? "خطا");
    });
  }

  function handleDelete(commentId: string) {
    if (!confirm("این نظر برای همیشه حذف می‌شود. مطمئنید؟")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAction(commentId);
      if (result.success) runSearch(page);
      else setError(result.error ?? "خطا");
    });
  }

  function startEdit(comment: ModerationCommentRow) {
    setEditingId(comment.id);
    setEditValue(comment.content);
  }

  function handleSaveEdit(commentId: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateContentAction(commentId, editValue);
      if (result.success) {
        setEditingId(null);
        runSearch(page);
      } else {
        setError(result.error ?? "خطا");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            const value = e.target.value as CommentStatus | "";
            setStatusFilter(value);
            runSearch(1, value);
          }}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="APPROVED">تاییدشده</option>
          <option value="PENDING">در انتظار بررسی</option>
          <option value="REJECTED">مخفی‌شده</option>
        </select>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>

      <div className="divide-y divide-border rounded-md border border-border">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-text-muted">
                <span className="font-medium text-text-main">{authorName(comment.user)}</span>
                {" · "}
                {comment.chapter.comic.title} — چپتر {comment.chapter.chapterNumber}
                {" · "}
                {new Date(comment.createdAt).toLocaleString("fa-IR")}
                {comment.editedAt && <span className="text-accent"> · ویرایش‌شده</span>}
                {comment.isStaffReply && <span className="text-primary"> · پاسخ تیم</span>}
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  comment.status === "APPROVED"
                    ? "bg-primary/10 text-primary"
                    : comment.status === "PENDING"
                    ? "bg-accent/10 text-accent"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {STATUS_LABELS[comment.status]}
              </span>
            </div>

            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleSaveEdit(comment.id)} disabled={isPending} className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50">
                    ذخیره
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-md border border-border px-3 py-1 text-xs text-text-muted">
                    انصراف
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-main">{comment.content}</p>
            )}

            {editingId !== comment.id && (
              <div className="flex flex-wrap gap-2">
                {comment.status !== "APPROVED" && (
                  <button onClick={() => handleStatus(comment.id, "APPROVED")} disabled={isPending} className="rounded-md border border-primary px-2 py-1 text-xs text-primary disabled:opacity-50">
                    تایید
                  </button>
                )}
                {comment.status !== "PENDING" && (
                  <button onClick={() => handleStatus(comment.id, "PENDING")} disabled={isPending} className="rounded-md border border-accent px-2 py-1 text-xs text-accent disabled:opacity-50">
                    بازگشت به انتظار
                  </button>
                )}
                {comment.status !== "REJECTED" && (
                  <button onClick={() => handleStatus(comment.id, "REJECTED")} disabled={isPending} className="rounded-md border border-border px-2 py-1 text-xs text-text-muted disabled:opacity-50">
                    مخفی‌سازی
                  </button>
                )}
                <button onClick={() => startEdit(comment)} disabled={isPending} className="rounded-md border border-border px-2 py-1 text-xs text-text-main disabled:opacity-50">
                  ویرایش
                </button>
                <button onClick={() => handleDelete(comment.id)} disabled={isPending} className="rounded-md border border-red-400 px-2 py-1 text-xs text-red-400 disabled:opacity-50">
                  حذف
                </button>
              </div>
            )}
          </div>
        ))}
        {comments.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">نظری یافت نشد.</p>}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{total.toLocaleString("fa-IR")} نظر</span>
        <div className="flex gap-2">
          <button onClick={() => runSearch(page - 1)} disabled={page <= 1 || isPending} className="disabled:opacity-30">قبلی</button>
          <button onClick={() => runSearch(page + 1)} disabled={page * 25 >= total || isPending} className="disabled:opacity-30">بعدی</button>
        </div>
      </div>
    </div>
  );
}