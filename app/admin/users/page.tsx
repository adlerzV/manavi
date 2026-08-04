import { searchUsers } from "@/app/admin/actions/user-management";
import { UserManagementTable } from "@/components/admin/user-management-table";

export default async function AdminUsersPage() {
  const { users, total } = await searchUsers({ page: 1 });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">مدیریت کاربران</h1>
      <UserManagementTable initialUsers={users} initialTotal={total} />
    </div>
  );
}