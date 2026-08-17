import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAllGenres } from "@/lib/genres";
import { getAllCategories } from "@/lib/categories";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { PublisherCreateComicForm } from "@/components/publisher/create-comic-form";

export default async function PublisherComicsPage() {
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

  const [comics, genres, categories] = await Promise.all([
    prisma.comic.findMany({
      where: { license: { publisherId: context.publisherId } },
      orderBy: { createdAt: "desc" },
      include: {
        license: { select: { status: true } },
        chapters: { select: { id: true, publishedAt: true } },
      },
    }),
    getAllGenres(),
    getAllCategories(),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-text-main">آثار من</h1>

      {context.canManageComics && (
        <CollapsibleSection triggerLabel="افزودن عنوان جدید">
          <PublisherCreateComicForm
            genres={genres.map((g) => ({ id: g.id, name: g.name }))}
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              defaultReadingMode: c.defaultReadingMode,
            }))}
          />
        </CollapsibleSection>
      )}

      <div className="divide-y divide-border rounded-md border border-border">
        {comics.map((c) => {
          const published = c.chapters.filter((ch) => ch.publishedAt).length;
          return (
            <Link
              key={c.id}
              href={`/publisher/comics/${c.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-background"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm text-text-main">{c.title}</p>
                {c.approvalStatus !== "APPROVED" && (
                  <span className="text-xs text-accent">
                    {c.approvalStatus === "NEEDS_CHANGES" ? "نیاز به اصلاح" : "در انتظار تایید"}
                  </span>
                )}
              </div>
              <p className="text-xs text-text-muted">
                {c.license.status} · {published}/{c.chapters.length} چپتر منتشرشده
              </p>
            </Link>
          );
        })}
        {comics.length === 0 && (
          <p className="px-4 py-3 text-sm text-text-muted">هنوز عنوانی تحت لایسنس شما ثبت نشده.</p>
        )}
      </div>
    </div>
  );
}