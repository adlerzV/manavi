import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreateComicForm } from "@/components/admin/create-comic-form";
import { getAllGenres } from "@/lib/genres";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminComicsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  const [comics, licenses, genres] = await Promise.all([
    prisma.comic.findMany({
      where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        license: { select: { status: true } },
        chapters: { select: { id: true, publishedAt: true } },
      },
    }),
    prisma.license.findMany({
      where: { status: { notIn: ["EXPIRED", "TERMINATED"] } },
      include: { publisher: { select: { name: true } } },
    }),
    getAllGenres(),
  ]);

  const licenseOptions = licenses.map((l) => ({
    id: l.id,
    publisherName: l.publisher.name,
    territory: l.territory,
    status: l.status,
  }));

  return (
    <div className="space-y-8">
      <CollapsibleSection triggerLabel="افزودن عنوان جدید">
        {(close) => (
          <CreateComicForm
            licenses={licenseOptions}
            genres={genres.map((g) => ({ id: g.id, name: g.name }))}
            onCreated={close}
          />
        )}
      </CollapsibleSection>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-text-main">لیست عناوین</h2>
          <form className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="جستجوی عنوان..."
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-main outline-none focus:border-primary"
            />
            <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              جستجو
            </button>
          </form>
        </div>

        <div className="divide-y divide-border rounded-md border border-border">
          {comics.map((c) => {
            const published = c.chapters.filter((ch) => ch.publishedAt).length;
            return (
              <Link
                key={c.id}
                href={`/admin/comics/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface"
              >
                <p className="text-sm text-text-main">{c.title}</p>
                <p className="text-xs text-text-muted">
                  {c.license.status} · {published}/{c.chapters.length} چپتر منتشرشده
                </p>
              </Link>
            );
          })}
          {comics.length === 0 && (
            <p className="px-4 py-3 text-sm text-text-muted">هنوز عنوانی ثبت نشده.</p>
          )}
        </div>
      </div>
    </div>
  );
}