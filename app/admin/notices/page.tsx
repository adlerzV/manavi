import { listNotices } from "@/app/admin/actions/notices";
import { NoticeManager } from "@/components/admin/notice-manager";

export default async function AdminNoticesPage() {
  const notices = await listNotices();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-text-main">اعلان‌ها</h1>
        <p className="mt-1 text-sm text-text-muted">
          یک نوار اعلان سبک بالای اپ برای همه کاربران نمایش داده می‌شود و بعد از مدت انتخابی خودکار پاک می‌شود.
        </p>
      </div>
      <NoticeManager initialNotices={notices} />
    </div>
  );
}