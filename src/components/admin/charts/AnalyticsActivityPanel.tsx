"use client";

import { useState } from "react";
import type { ActivityPoint } from "@/lib/data/admin";
import { ActivityAreaChart } from "./ActivityAreaChart";

const TABS: { key: keyof Omit<ActivityPoint, "date" | "label">; label: string; color: string }[] = [
  { key: "visualisations", label: "Visualisations", color: "#c9a96e" },
  { key: "downloads", label: "Downloads", color: "#60a5fa" },
  { key: "shares", label: "Shares", color: "#f472b6" },
  { key: "newUsers", label: "New Users", color: "#4ade80" },
];

export function AnalyticsActivityPanel({ data }: { data: ActivityPoint[] }) {
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("visualisations");
  const activeTab = TABS.find((t) => t.key === active)!;

  return (
    <div className="rounded-xl border border-panel-border bg-white/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-white">Activity Over Time</h2>
        <div className="flex gap-1 rounded-lg border border-panel-border bg-white/5 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                active === tab.key ? "bg-brand-gold text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <ActivityAreaChart data={data} dataKey={activeTab.key} color={activeTab.color} />
      </div>
    </div>
  );
}
