import { getDashboardStats, getShareChannelBreakdown, getTopStones, getActivityTimeSeries } from "@/lib/data/admin";
import { getPlatformSettings } from "@/lib/data/settings";
import { AnalyticsActivityPanel } from "@/components/admin/charts/AnalyticsActivityPanel";
import { MiniLineChart } from "@/components/admin/charts/MiniLineChart";
import { MessageCircle, Link2, Mail, Share2 } from "lucide-react";

// lucide-react doesn't ship brand/social marks (Facebook, LinkedIn, X, etc.
// were removed from the library over trademark concerns) - generic shapes
// distinguished by brand color instead, matching ShareMenu.tsx's approach.
const CHANNELS: Record<string, { label: string; icon: typeof MessageCircle; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  copy_link: { label: "Copy Link", icon: Link2, color: "#60a5fa" },
  email: { label: "Email", icon: Mail, color: "#c9a96e" },
  facebook: { label: "Facebook", icon: Share2, color: "#1877F2" },
  linkedin: { label: "LinkedIn", icon: Share2, color: "#0A66C2" },
  x: { label: "X", icon: Share2, color: "#e5e5e5" },
};

export default async function AdminAnalyticsPage() {
  const [stats, settings, shareChannels, topStones, activity] = await Promise.all([
    getDashboardStats(),
    getPlatformSettings(),
    getShareChannelBreakdown(),
    getTopStones(),
    getActivityTimeSeries(30),
  ]);

  const totalShares = Object.values(shareChannels).reduce((a, b) => a + b, 0) || 1;
  const sortedChannels = Object.entries(shareChannels).sort((a, b) => b[1] - a[1]);

  const newUsersWeek = activity.slice(-7).reduce((sum, p) => sum + p.newUsers, 0);
  const newUsersDailyAvg = activity.length
    ? (activity.reduce((sum, p) => sum + p.newUsers, 0) / activity.length).toFixed(1)
    : "0.0";

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-white/50">Last 30 days.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MiniStat label="Total Visualisations (30d)" value={stats.visualisations30d} />
        <MiniStat label="Downloads (30d)" value={stats.downloads30d} />
        <MiniStat label="Shares (30d)" value={stats.shares30d} />
        <MiniStat label="New Users (30d)" value={stats.newUsers30d} />
        <MiniStat
          label="Est. Monthly Revenue"
          value={new Intl.NumberFormat("en-GB", { style: "currency", currency: settings.currency.toUpperCase() }).format(
            stats.estRevenueCents / 100,
          )}
        />
        <MiniStat label="Total Users" value={stats.totalUsers} />
      </div>

      <div className="mt-6">
        <AnalyticsActivityPanel data={activity} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Share Channels</h2>
          <div className="mt-4 flex flex-col gap-3">
            {sortedChannels.length === 0 && <p className="text-sm text-white/30">No shares yet.</p>}
            {sortedChannels.map(([channel, count]) => {
              const meta = CHANNELS[channel] ?? { label: channel, icon: Link2, color: "#c9a96e" };
              const Icon = meta.icon;
              return (
                <div key={channel}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-white/70">
                      <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} /> {meta.label}
                    </span>
                    <span className="text-white/40">
                      {Math.round((count / totalShares) * 100)}% ({count})
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(count / totalShares) * 100}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Top Stones</h2>
          <div className="mt-4 flex flex-col gap-3">
            {topStones.length === 0 && <p className="text-sm text-white/30">No renders yet.</p>}
            {topStones.map((stone, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-xs font-semibold text-white/30">{i + 1}</span>
                <img src={stone.textureUrl} alt={stone.name} className="h-8 w-8 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-white/80">{stone.name}</p>
                  <p className="truncate text-xs text-white/30">{stone.brand}</p>
                </div>
                <span className="whitespace-nowrap font-semibold text-brand-gold">{stone.uses} uses</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">New Users (30d)</h2>
          <div className="mt-2">
            <MiniLineChart data={activity} />
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <div>
              <p className="uppercase tracking-wide text-white/40">30D Total</p>
              <p className="font-semibold text-white">{stats.newUsers30d}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide text-white/40">This Week</p>
              <p className="font-semibold text-emerald-400">{newUsersWeek}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide text-white/40">Daily Avg</p>
              <p className="font-semibold text-white">{newUsersDailyAvg}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-panel-border bg-white/5 p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
