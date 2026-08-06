import { prisma } from "@/lib/prisma";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { CreatePublisherForm } from "@/components/admin/create-publisher-form";
import { PublisherOwnerLink } from "@/components/admin/publisher-owner-link";

export default async function AdminPublishersPage() {
  const publishers = await prisma.publisher.findMany({
    orderBy: { createdAt: "desc" },
    include: { licenses: { select: { id: true } }, contractUser: { select: { username: true } } },
  });

  return (
    <div className="space-y-8">
      <CollapsibleSection triggerLabel="افزودن ناشر جدید">
        <CreatePublisherForm />
      </CollapsibleSection>
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-text-main">لیست ناشران</h2>
        <div className="divide-y divide-border rounded-md border border-border">
          {publishers.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm text-text-main">{p.name}</p>
                <p className="text-xs text-text-muted">{p.contactEmail}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-text-muted">{p.licenses.length} لایسنس</span>
                <PublisherOwnerLink publisherId={p.id} ownerUsername={p.contractUser?.username ?? null} />
              </div>
            </div>
          ))}
          {publishers.length === 0 && <p className="px-4 py-3 text-sm text-text-muted">هنوز ناشری ثبت نشده است.</p>}
        </div>
      </div>
    </div>
  );
}