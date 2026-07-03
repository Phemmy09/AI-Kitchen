import { Users, UserCheck, Image as ImageIcon, Share2, DollarSign, UserX } from "lucide-react";
import { getDashboardStats } from "@/lib/data/admin";
import { getPlatformSettings } from "@/lib/data/settings";
import { StatCard } from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const [stats, settings] = await Promise.all([getDashboardStats(), getPlatformSettings()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-1 text-sm text-white/50">Here&apos;s what&apos;s happening with RatedWorktops today.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={UserCheck} label="Active Users" value={stats.activeUsers} />
        <StatCard icon={UserX} label="Suspended" value={stats.suspendedUsers} />
        <StatCard icon={ImageIcon} label="Visualisations (30d)" value={stats.visualisations30d} />
        <StatCard icon={Share2} label="Shares (30d)" value={stats.shares30d} />
        <StatCard
          icon={DollarSign}
          label="Est. Monthly Revenue"
          value={new Intl.NumberFormat("en-US", { style: "currency", currency: settings.currency.toUpperCase() }).format(
            stats.estRevenueCents / 100,
          )}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Platform Status</h2>
          <dl className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b border-panel-border pb-2">
              <dt className="text-white/50">Free Credits</dt>
              <dd className={settings.free_credits_enabled ? "text-emerald-400" : "text-red-400"}>
                {settings.free_credits_enabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-panel-border pb-2">
              <dt className="text-white/50">Subscriptions</dt>
              <dd className={settings.subscriptions_enabled ? "text-emerald-400" : "text-red-400"}>
                {settings.subscriptions_enabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-panel-border pb-2">
              <dt className="text-white/50">Free Credit Amount</dt>
              <dd className="text-white">{settings.free_credit_amount} credits</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Storage Expiry</dt>
              <dd className="text-white">{settings.temp_storage_hours}h</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Paid Users</h2>
          <p className="mt-4 text-3xl font-bold text-brand-gold">{stats.paidUsers}</p>
          <p className="text-xs text-white/40">of {stats.totalUsers} total users</p>
        </div>
      </div>
    </div>
  );
}
