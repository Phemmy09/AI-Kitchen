import type { LucideIcon } from "lucide-react";

export function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <div className="gold-edge rounded-xl border border-panel-border bg-white/5 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--border-gold)] hover:shadow-[0_8px_40px_rgba(201,169,110,0.18)]">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-gold/10 text-brand-gold">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
    </div>
  );
}
