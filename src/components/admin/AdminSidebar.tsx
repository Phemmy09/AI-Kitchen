"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LineChart, Users, Layers, ListTree, CreditCard, ScrollText, LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/lib/data/profile";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stones", label: "Stone Library", icon: Layers },
  { href: "/admin/categories", label: "Categories", icon: ListTree },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/admin/settings", label: "Subscriptions", icon: CreditCard },
];

export function AdminSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-panel-border bg-panel">
      <div className="flex items-center gap-3 border-b border-panel-border px-5 py-5">
        <img src="/logo.svg" alt="RatedWorktops" className="h-9 w-9 rounded-lg" />
        <div className="leading-none">
          <p className="font-display text-sm font-bold text-white">RatedWorktops</p>
          <p className="text-[10px] uppercase tracking-widest text-white/40">Admin Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith(href)
                ? "bg-brand-gold/10 text-brand-gold"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-panel-border p-4">
        <p className="truncate text-sm font-semibold text-white">{profile.name}</p>
        <p className="truncate text-xs capitalize text-brand-gold">{profile.role.replace("_", " ")}</p>
        <form action={signOut} className="mt-3">
          <button className="flex items-center gap-2 text-xs text-white/40 hover:text-white">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
