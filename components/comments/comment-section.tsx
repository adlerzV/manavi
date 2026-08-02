"use client";

import { useState, type FormEvent } from "react";
import { createComment } from "@/app/actions/comments";
import { useTelegramAuth } from "@/components/providers/telegram-auth-provider";

interface CommentAuthor {
  firstName: string;
  lastName: string | null;
  username: string | null;
}

interface CommentData {
  id: string;
  content: string;
  isSpoiler: boolean;
  createdAt: string;
  user: CommentAuthor;
}

function authorName(user: CommentAuthor) {
  return user.username ? `@${user.username}` : `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`;
}

function SpoilerComment({ comment }: { comment: CommentData }) {
  const [revealed, setRevealed] = useState(false);
  if (!comment.isSpoiler || revealed) {
    return <p className="text-sm text-text-main">{comment.content}</p>;
  }
  return (
    <button
      onClick={() => setRevealed(true)}
      className="w-full rounded-md bg-background px-3 py-2 text-right text-sm text-text-muted"
    >
      این نظر حاوی اسپویلر است — برای نمایش ضربه بزنید
      <span className="mt-1 block select-none blur-sm">{comment.content}</span>
    </button>
  );
}

export function CommentSection({
  chapterId,
  initialComments,
}: {
  chapterId: string;
  initialComments: CommentData[];
}) {
  const { user } = useTelegramAuth();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || pending) return;

    setPending(true);
    setError(null);

    const optimisticComment: CommentData = {
      id: `optimistic-${Date.now()}`,
      content: content.trim(),
      isSpoiler,
      createdAt: new Date().toISOString(),
      user: {
        firstName: user?.firstName ?? "شما",
        lastName: user?.lastName ?? null,
        username: user?.username ?? null,
      },
    };

    setComments((prev) => [optimisticComment, ...prev]);
    setContent("");

    const result = await createComment({ chapterId, content: optimisticComment.content, isSpoiler });

    if (!result.success || !result.comment) {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setError(result.error ?? "ثبت نظر با خطا مواجه شد");
    } else {
      const confirmed = result.comment;
      setComments((prev) => prev.map((c) => (c.id === optimisticComment.id ? confirmed : c)));
    }

    setIsSpoiler(false);
    setPending(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h2 className="mb-4 text-lg font-medium text-text-main">نظرات</h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="نظر خود را بنویسید..."
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-main outline-none focus:border-primary"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-text-muted">
              <input type="checkbox" checked={isSpoiler} onChange={(e) => setIsSpoiler(e.target.checked)} />
              حاوی اسپویلر است
            </label>
            <button
              type="submit"
              disabled={pending || !content.trim()}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              ارسال
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </form>
      ) : (
        <p className="mb-6 text-sm text-text-muted">برای ثبت نظر باید از داخل تلگرام وارد شوید.</p>
      )}

      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-text-muted">هنوز نظری ثبت نشده است.</p>}
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-md border border-border bg-surface p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-medium text-text-main">{authorName(comment.user)}</span>
              <span className="text-xs text-text-muted">
                {new Date(comment.createdAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            <SpoilerComment comment={comment} />
          </div>
        ))}
      </div>
    </div>
  );
}