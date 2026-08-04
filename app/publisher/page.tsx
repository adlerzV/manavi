import { RoyaltyDashboard } from "@/components/publisher/royalty-dashboard";

export default function PublisherDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">داشبورد ناشر</h1>
      <RoyaltyDashboard />
    </div>
  );
}