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
      where: q
        ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] }
        : undefined,
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        license: { select: { status: true } },
        _count: {
          select: {
            chapters: true, 
          },
        },
        chapters: {
          where: { status: "PUBLISHED" },
          select: { id: true }, 
        },
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
        <CreateComicForm
          licenses={licenseOptions}
          genres={genres.map((g) => ({ id: g.id, name: g.name }))}
        />
      </CollapsibleSection>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-text-main">لیست عناوین</h2>
          <form className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="جستجوی عنوان یا اسلاگ..."
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-main outline-none focus:border-primary"
            />
            <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              جستجو
            </button>
          </form>
        </div>

        <div className="divide-y divide-border rounded-md border border-border">
          {comics.map((c) => {
            const totalChapters = c._count.chapters;
            const publishedChapters = c.chapters.length;

            return (
              <Link
                key={c.id}
                href={`/admin/comics/${c.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-surface"
              >
                <div>
                  <p className="text-sm text-text-main">{c.title}</p>
                  <p className="text-xs text-text-muted">اسلاگ: {c.slug}</p>
                </div>
                <p className="text-xs text-text-muted">
                  {c.license.status} · {publishedChapters}/{totalChapters} چپتر منتشرشده
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