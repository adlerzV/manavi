import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreateLicenseForm } from "@/components/admin/create-license-form";
import { LicenseRowActions } from "@/components/admin/license-row-actions";

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function AdminLicensesPage({ searchParams }: PageProps) {
  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const query = q?.trim();

  const where = query
    ? {
        OR: [
          { publisher: { name: { contains: query, mode: "insensitive" as const } } },
          { territory: { has: query.toUpperCase() } },
          { contractReference: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [licenses, total, publishers] = await Promise.all([
    prisma.license.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { publisher: { select: { name: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.license.count({ where }),
    prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(nextPage: number): string {
    const qp = new URLSearchParams();
    if (query) qp.set("q", query);
    if (nextPage > 1) qp.set("page", String(nextPage));
    const qs = qp.toString();
    return `/admin/licenses${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-8">
      <CollapsibleSection triggerLabel="افزودن لایسنس جدید">
        <CreateLicenseForm publishers={publishers} />
      </CollapsibleSection>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-text-main">لیست لایسنس‌ها</h2>
          <form className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="جستجوی نام ناشر، قلمرو یا شماره قرارداد..."
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-text-main outline-none focus:border-primary"
            />
            <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">جستجو</button>
          </form>
          <span className="text-xs text-text-muted">{total.toLocaleString("fa-IR")} مورد</span>
        </div>
        <div className="divide-y divide-border rounded-md border border-border">
          {licenses.map((l) => (
            <div key={l.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm text-text-main">
                  {l.publisher.name} — {l.territory.join("/")}
                </p>
                <p className="text-xs text-text-muted">
                  {l.status} · شروع: {l.startDate.toLocaleDateString("fa-IR")}
                  {l.endDate ? ` · پایان: ${l.endDate.toLocaleDateString("fa-IR")}` : ""}
                  {l.contractReference ? ` · قرارداد: ${l.contractReference}` : ""}
                </p>
              </div>
              <LicenseRowActions licenseId={l.id} status={l.status} />
            </div>
          ))}
          {licenses.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">موردی یافت نشد.</p>}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-xs text-text-muted">
            <Link href={buildHref(page - 1)} className={`rounded-md border border-border px-3 py-1.5 ${page <= 1 ? "pointer-events-none opacity-30" : "hover:border-primary"}`}>
              قبلی
            </Link>
            <span>صفحه {page.toLocaleString("fa-IR")} از {totalPages.toLocaleString("fa-IR")}</span>
            <Link href={buildHref(page + 1)} className={`rounded-md border border-border px-3 py-1.5 ${page >= totalPages ? "pointer-events-none opacity-30" : "hover:border-primary"}`}>
              بعدی
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}