import Link from "next/link";
import Image from "next/image";
import type { LatestCommentItem } from "@/lib/home-feed";

export function LatestCommentsSection({ comments }: { comments: LatestCommentItem[] }) {
  if (comments.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="mb-3 text-base font-medium text-text-main">آخرین نظرات</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {comments.map((comment) => (
          <Link
            key={comment.id}
            href={`/app/read/${comment.chapterId}`}
            className="flex w-52 flex-shrink-0 flex-col gap-2 rounded-md border border-border bg-surface p-3"
          >
            <div className="flex items-center gap-2">
              <div className="relative h-12 w-9 flex-shrink-0 overflow-hidden rounded" style={{ backgroundColor: comment.comic.dominantColor ?? "#1E1E1E" }}>
                <Image src={comment.comic.coverImage} alt={comment.comic.title} fill sizes="36px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-text-main">{comment.comic.title}</p>
                <p className="text-[10px] text-text-muted">چپتر {comment.chapterNumber.toLocaleString("fa-IR")}</p>
              </div>
            </div>
            <p className="line-clamp-3 text-xs text-text-muted">{comment.content}</p>
            <p className="text-[10px] text-text-muted">
              {comment.user.username ? `@${comment.user.username}` : comment.user.firstName}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}