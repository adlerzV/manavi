import { searchAuditLog } from "@/lib/audit-log";
import { requireAdmin } from "@/lib/auth";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { AuditLogCleanupButton } from "@/components/admin/audit-log-cleanup-button";

export default async function AdminLogsPage() {
  await requireAdmin();
  const { logs, total } = await searchAuditLog({ page: 1 });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">لاگ سیستم</h1>
      <AuditLogCleanupButton />
      <AuditLogTable initial={logs} initialTotal={total} />
    </div>
  );
}