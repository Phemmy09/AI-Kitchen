import Link from "next/link";
import {
  Users,
  UserCheck,
  Image as ImageIcon,
  Download,
  Share2,
  DollarSign,
  Layers,
  Search,
  CreditCard,
  ListTree,
  LineChart,
} from "lucide-react";
import { getDashboardStats, getActivityTimeSeries, getAllUsers } from "@/lib/data/admin";
import { getPlatformSettings } from "@/lib/data/settings";
import { StatCard } from "@/components/admin/StatCard";
import { ActivityAreaChart } from "@/components/admin/charts/ActivityAreaChart";
import { PlanDonutChart } from "@/components/admin/charts/PlanDonutChart";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboardPage() {
  const [stats, settings, activity, users] = await Promise.all([
    getDashboardStats(),
    getPlatformSettings(),
    getActivityTimeSeries(30),
    getAllUsers(),
  ]);

  const recentUsers = users.slice(0, 5);
  const totalVis = activity.reduce((sum, p) => sum + p.visualisations, 0);
  const dailyAvg = activity.length ? (totalVis / activity.length).toFixed(1) : "0.0";
  const peakDay = Math.max(0, ...activity.map((p) => p.visualisations));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {greeting()}, Admin <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">Here&apos;s what&apos;s happening with RatedWorktops today.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/users"
            className="rounded-lg border border-panel-border bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            View Users
          </Link>
          <Link
            href="/admin/stones"
            className="rounded-lg bg-gradient-to-b from-brand-gold to-brand-gold-dark px-4 py-2 text-sm font-semibold text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]"
          >
            Manage Stones
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={UserCheck} label="Active Users" value={stats.activeUsers} />
        <StatCard icon={ImageIcon} label="Visualisations" value={stats.visualisations30d} />
        <StatCard icon={Download} label="Downloads" value={stats.downloads30d} />
        <StatCard icon={Share2} label="Shares" value={stats.shares30d} />
        <StatCard
          icon={DollarSign}
          label="Est. Revenue"
          value={new Intl.NumberFormat("en-GB", { style: "currency", currency: settings.currency.toUpperCase() }).format(
            stats.estRevenueCents / 100,
          )}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Visualisations — Last 30 Days</h2>
          <ActivityAreaChart data={activity} dataKey="visualisations" />
          <div className="mt-2 flex gap-8 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">Total</p>
              <p className="font-semibold text-white">{totalVis}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">Daily Avg</p>
              <p className="font-semibold text-white">{dailyAvg}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-white/40">Peak Day</p>
              <p className="font-semibold text-white">{peakDay}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">User Plans</h2>
          <div className="mt-4">
            <PlanDonutChart {...stats.planBreakdown} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-xs font-semibold text-brand-gold hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-panel-border">
            {recentUsers.length === 0 && <p className="py-6 text-center text-sm text-white/30">No users yet.</p>}
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-xs font-bold text-brand-gold">
                    {u.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold capitalize text-white/60">
                  {u.plan}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <QuickAction href="/admin/stones" icon={Layers} label="Add New Stone Colour" />
            <QuickAction href="/admin/users" icon={Search} label="Search a User" />
            <QuickAction href="/admin/settings" icon={CreditCard} label="Subscription Settings" />
            <QuickAction href="/admin/categories" icon={ListTree} label="Manage Categories" />
            <QuickAction href="/admin/analytics" icon={LineChart} label="View Full Analytics" />
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-panel-border pt-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Platform Status</p>
            <StatusRow label="Free Credits" enabled={settings.free_credits_enabled} />
            <StatusRow label="Subscriptions" enabled={settings.subscriptions_enabled} />
            <div className="flex items-center justify-between">
              <span className="text-white/50">Free Credit Amount</span>
              <span className="text-white">{settings.free_credit_amount} credits</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50">Storage Expiry</span>
              <span className="text-white">{settings.temp_storage_hours}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Layers; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg border border-panel-border bg-white/5 px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function StatusRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
          enabled ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        }`}
      >
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}
