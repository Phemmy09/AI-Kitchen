import { getDashboardStats, getShareChannelBreakdown, getTopStones } from "@/lib/data/admin";

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  copy_link: "Copy Link",
  email: "Email",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  x: "X (Twitter)",
};

export default async function AdminAnalyticsPage() {
  const [stats, shareChannels, topStones] = await Promise.all([
    getDashboardStats(),
    getShareChannelBreakdown(),
    getTopStones(),
  ]);

  const totalShares = Object.values(shareChannels).reduce((a, b) => a + b, 0) || 1;
  const sortedChannels = Object.entries(shareChannels).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-white/50">Last 30 days.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="Visualisations" value={stats.visualisations30d} />
        <MiniStat label="Credits Spent" value={stats.creditsSpent30d} />
        <MiniStat label="Shares" value={stats.shares30d} />
        <MiniStat label="Paid Users" value={stats.paidUsers} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Share Channels</h2>
          <div className="mt-4 flex flex-col gap-3">
            {sortedChannels.length === 0 && <p className="text-sm text-white/30">No shares yet.</p>}
            {sortedChannels.map(([channel, count]) => (
              <div key={channel}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-white/70">{CHANNEL_LABELS[channel] ?? channel}</span>
                  <span className="text-white/40">
                    {Math.round((count / totalShares) * 100)}% ({count})
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-gold"
                    style={{ width: `${(count / totalShares) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-panel-border bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-white">Top Stones</h2>
          <div className="mt-4 flex flex-col gap-3">
            {topStones.length === 0 && <p className="text-sm text-white/30">No renders yet.</p>}
            {topStones.map((stone, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-white/80">{stone.name}</p>
                  <p className="text-xs text-white/30">{stone.brand}</p>
                </div>
                <span className="font-semibold text-brand-gold">{stone.uses} uses</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-panel-border bg-white/5 p-4">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
