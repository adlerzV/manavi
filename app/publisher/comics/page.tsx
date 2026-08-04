import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function PublisherComicsPage() {
  const user = await getSessionUser();
  if (!user?.publisherProfile) redirect("/publisher");

  const comics = await prisma.comic.findMany({
    where: { license: { publisherId: user.publisherProfile.id } },
    orderBy: { createdAt: "desc" },
    include: { license: { select: { status: true } }, chapters: { select: { id: true, publishedAt: true } } },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-text-main">آثار من</h1>
      <div className="divide-y divide-border rounded-md border border-border">
        {comics.map((c) => {
          const published = c.chapters.filter((ch) => ch.publishedAt).length;
          return (
            <Link key={c.id} href={`/publisher/comics/${c.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-background">
              <p className="text-sm text-text-main">{c.title}</p>
              <p className="text-xs text-text-muted">{c.license.status} · {published}/{c.chapters.length} چپتر منتشرشده</p>
            </Link>
          );
        })}
        {comics.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز عنوانی تحت لایسنس شما ثبت نشده.</p>}
      </div>
    </div>
  );
}