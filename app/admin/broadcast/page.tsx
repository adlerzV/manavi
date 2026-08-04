import { BroadcastForm } from "@/components/admin/broadcast-form";

export default function AdminBroadcastPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">پیام همگانی</h1>
      <BroadcastForm />
    </div>
  );
}