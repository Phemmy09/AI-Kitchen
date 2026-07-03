import type { LucideIcon } from "lucide-react";

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-panel-border bg-white/5 p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
