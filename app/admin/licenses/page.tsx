import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreateLicenseForm } from "@/components/admin/create-license-form";
import { LicenseRowActions } from "@/components/admin/license-row-actions";

export default async function AdminLicensesPage() {
  const [licenses, publishers] = await Promise.all([
    prisma.license.findMany({
      orderBy: { createdAt: "desc" },
      include: { publisher: { select: { name: true } } },
    }),
    prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <CollapsibleSection triggerLabel="افزودن لایسنس جدید">
        <CreateLicenseForm publishers={publishers} />
      </CollapsibleSection>
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">لیست لایسنس‌ها</h2>
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
                </p>
              </div>
              <LicenseRowActions licenseId={l.id} status={l.status} />
            </div>
          ))}
          {licenses.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز لایسنسی ثبت نشده.</p>}
        </div>
      </div>
    </div>
  );
}