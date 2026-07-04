import { Users, UserCheck, UserX, Gem } from "lucide-react";
import { getAllUsers, getDashboardStats } from "@/lib/data/admin";
import { requireAdminProfile } from "@/lib/data/profile";
import { UsersTable } from "@/components/admin/UsersTable";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminUsersPage() {
  const [users, currentAdmin, stats] = await Promise.all([getAllUsers(), requireAdminProfile(), getDashboardStats()]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Users</h1>
          <p className="mt-1 text-sm text-white/50">{users.length} total users</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={UserCheck} label="Active" value={stats.activeUsers} />
        <StatCard icon={UserX} label="Suspended" value={stats.suspendedUsers} />
        <StatCard icon={Gem} label="Paid Users" value={stats.paidUsers} />
      </div>

      <UsersTable users={users} isSuperAdmin={currentAdmin.role === "super_admin"} currentAdminId={currentAdmin.id} />
    </div>
  );
}
