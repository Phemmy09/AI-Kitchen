"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PLAN_COLORS: Record<string, string> = {
  Free: "#60a5fa",
  Pro: "#c9a96e",
  Studio: "#4ade80",
};

export function PlanDonutChart({ free, monthly, annual }: { free: number; monthly: number; annual: number }) {
  const total = free + monthly + annual;
  const data = [
    { name: "Free", value: free },
    { name: "Pro", value: monthly },
    { name: "Studio", value: annual },
  ];

  return (
    <div>
      <div className="relative mx-auto h-40 w-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={52} outerRadius={72} paddingAngle={total > 0 ? 3 : 0} stroke="none">
              {data.map((entry) => (
                <Cell key={entry.name} fill={PLAN_COLORS[entry.name]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-white/40">users</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.name] }} />
              {entry.name}
            </span>
            <span className="text-white/50">
              <span className="font-semibold text-white">{entry.value}</span>{" "}
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
