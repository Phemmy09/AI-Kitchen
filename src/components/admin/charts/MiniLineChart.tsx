"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import type { ActivityPoint } from "@/lib/data/admin";

export function MiniLineChart({ data, color = "#4ade80" }: { data: ActivityPoint[]; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={90}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <Tooltip
          contentStyle={{
            background: "#0f0f18",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ""}
          formatter={(value) => [value, "New Users"]}
        />
        <Line type="monotone" dataKey="newUsers" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
