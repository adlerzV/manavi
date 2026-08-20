import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [publisherCount, licenseCount, comicCount, unpublishedChapters, pendingChapterApprovals, pendingComics] =
    await Promise.all([
      prisma.publisher.count(),
      prisma.license.count(),
      prisma.comic.count(),
      prisma.chapter.count({ where: { publishedAt: null } }),
      prisma.chapter.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.comic.count({ where: { approvalStatus: { in: ["PENDING_APPROVAL", "NEEDS_CHANGES"] } } }),
    ]);

  const stats = [
    { label: "ناشران", value: publisherCount, href: "/admin/publishers" },
    { label: "لایسنس‌ها", value: licenseCount, href: "/admin/licenses" },
    { label: "عناوین", value: comicCount, href: "/admin/comics" },
    { label: "چپترهای منتشرنشده", value: unpublishedChapters, href: "/admin/comics" },
    { label: "عناوین در انتظار تایید", value: pendingComics, href: "/admin/chapter-approvals" },
    { label: "چپترهای در انتظار تایید", value: pendingChapterApprovals, href: "/admin/chapter-approvals" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className="rounded-md border border-border bg-surface p-4 text-center hover:border-primary"
        >
          <p className="text-2xl font-semibold text-primary">{stat.value.toLocaleString("fa-IR")}</p>
          <p className="mt-1 text-xs text-text-muted">{stat.label}</p>
        </Link>
      ))}
    </div>
  );
}