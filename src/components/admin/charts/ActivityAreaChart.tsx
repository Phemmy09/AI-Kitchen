"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { ActivityPoint } from "@/lib/data/admin";

const LABELS: Record<keyof Omit<ActivityPoint, "date" | "label">, string> = {
  visualisations: "Visualisations",
  downloads: "Downloads",
  shares: "Shares",
  newUsers: "New Users",
};

export function ActivityAreaChart({
  data,
  dataKey,
  color = "#c9a96e",
}: {
  data: ActivityPoint[];
  dataKey: keyof Omit<ActivityPoint, "date" | "label">;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={40}
        />
        <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "#0f0f18",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "rgba(255,255,255,0.5)" }}
          formatter={(value) => [value, LABELS[dataKey]]}
        />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#fill-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
