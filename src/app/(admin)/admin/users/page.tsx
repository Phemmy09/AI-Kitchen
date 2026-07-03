import { getAllUsers } from "@/lib/data/admin";
import { requireAdminProfile } from "@/lib/data/profile";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const [users, currentAdmin] = await Promise.all([getAllUsers(), requireAdminProfile()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Users</h1>
          <p className="mt-1 text-sm text-white/50">{users.length} total users</p>
        </div>
      </div>

      <UsersTable users={users} isSuperAdmin={currentAdmin.role === "super_admin"} currentAdminId={currentAdmin.id} />
    </div>
  );
}
