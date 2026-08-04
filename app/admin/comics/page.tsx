// app/admin/comics/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CreateComicForm } from "@/components/admin/create-comic-form";

export default async function AdminComicsPage() {
  const [comics, licenses] = await Promise.all([
    prisma.comic.findMany({
      orderBy: { createdAt: "desc" },
      include: { license: { select: { status: true } }, chapters: { select: { id: true, publishedAt: true } } },
    }),
    prisma.license.findMany({
      where: { status: { notIn: ["EXPIRED", "TERMINATED"] } },
      include: { publisher: { select: { name: true } } },
    }),
  ]);

  const licenseOptions = licenses.map((l) => ({
    id: l.id,
    publisherName: l.publisher.name,
    territory: l.territory,
    status: l.status,
  }));

  return (
    <div className="space-y-8">
      <CreateComicForm licenses={licenseOptions} />
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">لیست عناوین</h2>
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
          {comics.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز عنوانی ثبت نشده.</p>}
        </div>
      </div>
    </div>
  );
}