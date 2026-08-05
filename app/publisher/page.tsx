import { getSessionUser, getPublisherContext } from "@/lib/auth";
import { RoyaltyDashboard } from "@/components/publisher/royalty-dashboard";
import { StaffOverview } from "@/components/publisher/staff-overview";

export default async function PublisherDashboardPage() {
  const user = await getSessionUser();
  const context = await getPublisherContext(user);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">داشبورد ناشر</h1>
      {context && !context.isOwner ? <StaffOverview firstName={user?.firstName ?? ""} /> : <RoyaltyDashboard />}
    </div>
  );
}